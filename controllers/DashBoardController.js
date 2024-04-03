import { ObjectId } from "mongodb";
import dbClient from "../utils/db";
import userUtils from "../utils/user";
import isValidObjectId from "../helpers/validateId";

class DashboardController {
  static async getChartData(req, res) {
    const token = req.header("X-Token");
    const userId = await userUtils.getUserIdAndKey(token);

    if (!userId) {
      return res.status(400).send({ error: "Missing user ID" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "Invalid user ID" });
    }

    try {
      // Fetch transaction data for the authenticated user
      const transactions = await dbClient.transactions
        .find({ userId: new ObjectId(userId) })
        .toArray();

      // Prepare data for different types of charts
      const yearlyData = []; // Array of objects for yearly transaction data
      const monthlyData = []; // Array of objects for monthly transaction data
      const pieChartData = []; // Object for pie chart data
      const dailyData = []; // Array of objects for daily transaction data
      const lineChartData = []; // Array of objects for line chart data

      //   totals for each transaction type (Buy, Sell, Transfer) in dollars
      const totals = {
        buy: 0,
        sell: 0,
        transfer: 0,
      };

      //   get the data from the transactions
      transactions.forEach((transaction) => {
        // Yearly transaction data
        // get the year of the transaction
        const date = new Date(transaction.date);
        const year = date.getFullYear();

        // Yearly data format should be like this:
        // [
        // {
        //     year: "2018",
        //     Buy: 4000,
        //     Sell: 2400,
        //     Transfer: 2400,
        //   },
        //   {}, ...
        // ]
        // check if the year already exists in the yearlyData array
        let existingYearData = yearlyData.find((data) => data.year === year);
        if (!existingYearData) {
          existingYearData = {
            year,
            buy: 0,
            sell: 0,
            transfer: 0,
          };
          yearlyData.push(existingYearData);
        }

        // Update the transaction type amount for the current year
        existingYearData[transaction.type] += transaction.amount;

        // Monthly data format should be like this:
        // [
        // {
        //     month: "January",
        //     Buy: 4000,
        //     Sell: 2400,
        //     Transfer: 2400,
        //   },
        //   {}, ...
        // ]

        // get the month of the transaction
        const month = date.toLocaleString("en-US", { month: "long" });

        // check if the month already exists in the monthlyData array
        let existingMonthData = monthlyData.find(
          (data) => data.month === month
        );
        if (!existingMonthData) {
          existingMonthData = {
            month,
            buy: 0,
            sell: 0,
            transfer: 0,
          };
          monthlyData.push(existingMonthData);
        }

        // Update the transaction type amount for the current month
        existingMonthData[transaction.type] += transaction.amount;

        //   line chart data format should be like this: (the weekly data for the last 4 weeks)
        // [
        // {
        //     week: "Week 1",
        //     Buy: 4000,
        //     Sell: 2400,
        //     Transfer: 2400,
        //   },
        //   {}, ...
        // ]

        // get the week of the transaction
        const week = date.toLocaleString("en-US", { week: "long" });

        // check if the week already exists in the lineChartData array
        let existingWeekData = lineChartData.find((data) => data.week === week);

        if (!existingWeekData) {
          existingWeekData = {
            week,
            buy: 0,
            sell: 0,
            transfer: 0,
          };
          lineChartData.push(existingWeekData);
        }

        // Update the transaction type amount for the current week
        existingWeekData[transaction.type] += transaction.amount;

        // Pie chart data format should be like this: (total amount for each symbol(coin))
        // [
        // {
        //     symbol: "BTC",
        //     amount: 4000,
        //   },
        //   {}, ...
        // ]

        // check if the symbol already exists in the pieChartData object
        let existingSymbolData = pieChartData.find(
          (data) => data.symbol === transaction.symbol
        );

        if (!existingSymbolData) {
          existingSymbolData = {
            symbol: transaction.symbol,
            amount: 0,
          };
          pieChartData.push(existingSymbolData);
        }

        // Update the amount for the current symbol
        existingSymbolData.amount += transaction.amount;

        // Daily data format should be like this: (total transactions per day)
        // [
        // {
        //     day: "2021-08-01",
        //     transactions: 4,
        //   },
        //   {}, ...
        // ]

        // get the day of the transaction
        const day = date.toISOString().split("T")[0];

        // check if the day already exists in the dailyData array
        let existingDayData = dailyData.find((data) => data.day === day);

        if (!existingDayData) {
          existingDayData = {
            day,
            transactions: 0,
          };
          dailyData.push(existingDayData);
        }

        // Update the total transactions for the current day
        existingDayData.transactions++;

        // Update the total amount for each transaction type
        totals[transaction.type] += transaction.amount * transaction.price;
      });

      // Return formatted data for each chart
      return res.status(200).send({
        yearlyData,
        monthlyData,
        pieChartData,
        dailyData,
        lineChartData,
        totals,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
}

export default DashboardController;
