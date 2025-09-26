import MonthlySpendingChart from "../components/MonthlySpendingChart";

export default function UIDemo() {
  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-light text-white">This month</h1>
        <MonthlySpendingChart
          categories={{
            "Transportation": 59.3,
            "Food & Dining": 1038.0500000000004,
            "Automotive": 82.35,
            "Personal Care": 79.30000000000001,
            "Other": 126.94999999999999,
            "Home & Garden": 346.29999999999995,
            "Retail & Shopping": 150.25,
            "Entertainment & Recreation": 3.8499999999999996
          }}
          totalAmount={10000}
        />
        <h1 className="text-3xl font-light text-white">Transactions</h1>
        <ul className="mt-2">
          <li className="flex justify-between bg-neutral-900 items-center p-4 shadow-sm transition-all duration-200 mb-2">
            <div>
              <h4 className="text-md text-white capitalize">metzgerei nessier ag</h4>
              <p className="whitespace-nowrap text-sm text-gray-300">Jul 30, 2025</p>
            </div>
            <div className="text-right">
              <p className="whitespace-nowrap text-sm text-white">-146.35 CHF</p>
              <p className="whitespace-nowrap text-sm text-gray-400">-18.00 EUR</p>
            </div>
          </li>
          <li className="flex justify-between bg-neutral-900 items-center p-4 shadow-sm transition-all duration-200 mb-2">
            <div>
              <h4 className="text-md text-white capitalize">metzgerei nessier ag</h4>
              <p className="whitespace-nowrap text-sm text-gray-300">Jul 30, 2025</p>
            </div>
            <div className="text-right">
              <p className="whitespace-nowrap text-sm text-white">-146.35 CHF</p>
              <p className="whitespace-nowrap text-sm text-gray-400">-18.00 EUR</p>
            </div>
          </li>
          <li className="flex justify-between bg-neutral-900 items-center p-4 shadow-sm transition-all duration-200 mb-2">
            <div>
              <h4 className="text-md text-white capitalize">metzgerei nessier ag</h4>
              <p className="whitespace-nowrap text-sm text-gray-300">Jul 30, 2025</p>
            </div>
            <div className="text-right">
              <p className="whitespace-nowrap text-sm text-white">-146.35 CHF</p>
              <p className="whitespace-nowrap text-sm text-gray-400">-18.00 EUR</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}