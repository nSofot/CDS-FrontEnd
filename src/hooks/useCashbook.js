import { useEffect, useState } from "react";
import axios from "axios";

export function useCashbook(accountId, fromDate, toDate) {
  const [cashbook, setCashbook] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const [balanceBF, setBalanceBF]   = useState(0);
  const [receivedAm, setReceivedAm] = useState(0);
  const [spentAm, setSpentAm]       = useState(0);

  useEffect(() => {
    if (!accountId || !fromDate || !toDate) return;

    const fetchCashbook = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction/${encodeURIComponent(accountId)}`
        );

        const { rows, totals } = transformCashbook(data, fromDate, toDate);

        setCashbook(rows);
        setBalanceBF(totals.balanceBF);
        setReceivedAm(totals.receivedAm);
        setSpentAm(totals.spentAm);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch cash-book data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCashbook();
  }, [accountId, fromDate, toDate]);

  return { cashbook, loading, error, balanceBF, receivedAm, spentAm };
}

/* ---------------------------------------------------------------------- */
/* Helper: transform + totals                                             */
/* ---------------------------------------------------------------------- */
function transformCashbook(data, fromDate, toDate) {
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(toDate);
  end.setHours(23, 59, 59, 999);

  const beforeStart = [];
  const inRange     = [];

  for (const trx of data) {
    const d = new Date(trx.trxDate);
    if (d < start)      beforeStart.push(trx);
    else if (d <= end)  inRange.push(trx);
  }

  // 🔹 Balance B/F
  const balanceBF = beforeStart.reduce(
    (sum, t) => sum + (!t.isCredit ? t.trxAmount : -t.trxAmount),
    0
  );

  let rows = [];
  let running = balanceBF;

  if (balanceBF !== 0) {
    rows.push(makeRow({
      trxDate   : start,
      trxId     : "B/F",
      transactionType: "Balance B/F",
      description: "As At " + start.toLocaleDateString("en-GB"),
      isCredit  : balanceBF < 0,
      trxAmount : Math.abs(balanceBF),
      createdAt : start,
    }, balanceBF));
  }

  // 🔹 Totals inside range
  let receivedAm = 0;
  let spentAm = 0;

  const mapped = inRange
    .sort((a, b) => new Date(a.trxDate) - new Date(b.trxDate))
    .map(trx => {
      running += !trx.isCredit ? trx.trxAmount : -trx.trxAmount;

      // received = debit (isCredit=false), spent = credit (isCredit=true)
      if (!trx.isCredit) {
        receivedAm += trx.trxAmount;
      } else {
        spentAm += trx.trxAmount;
      }

      return makeRow(trx, running);
    });

  return {
    rows: [...rows, ...mapped],
    totals: { balanceBF, receivedAm, spentAm }
  };
}

/* ---------------------------------------------------------------------- */
function makeRow(trx, runningBalance) {
  const isCredit = trx.isCredit;

  return {
    date       : new Date(trx.trxDate).toLocaleDateString("en-GB"),
    trxId      : trx.trxBookNo || trx.trxId,
    trxType    : trx.transactionType || "",
    description: trx.description || "",
    debit      : !isCredit ? trx.trxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00",
    credit     : isCredit  ? trx.trxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00",
    balance    : runningBalance.toLocaleString("en-US", { minimumFractionDigits: 2 }),
    createdAt  : new Date(trx.createdAt),
  };
}
