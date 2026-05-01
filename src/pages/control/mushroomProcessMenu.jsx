import { useNavigate } from "react-router-dom";

export default function MushroomProcessMenu() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Substrate Bag Production",
      desc: "Filled with sawdust / straw / coco coir mix",
      path: "/make-substrate-bag",
      color: "bg-green-500",
    },
    {
      title: "Sterilized Substrate Bag",
      desc: "After heat treatment in boiler / autoclave",
      path: "/make-sterilized-bag",
      color: "bg-blue-500",
    },
    {
      title: "Inoculated Substrate Bag",
      desc: "After adding mushroom spawn",
      path: "/inoculated-substrate-bag",
      color: "bg-orange-500",
    },
    {
      title: "Incubated Substrate Bag",
      desc: "After colonization (mycelium growth stage)",
      path: "/incubated-substrate-bag",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🍄 Mushroom Production Process
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition p-5 border-l-8"
            style={{ borderColor: item.color.replace("bg-", "#") }}
          >
            <div className={`w-3 h-3 rounded-full mb-3 ${item.color}`} />
            
            <h2 className="text-xl font-semibold text-gray-800">
              {item.title}
            </h2>

            <p className="text-gray-600 mt-2 text-sm">{item.desc}</p>

            <button className="mt-4 px-4 py-2 text-white rounded-lg bg-gray-800 hover:bg-black">
              Open →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}