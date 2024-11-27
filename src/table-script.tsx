import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useMemo } from "react";
import sourceData from "./source-data.json";
import type { SourceDataType, TableDataType } from "./types";

/**
 * Example of how a tableData object should be structured.
 *
 * Each `row` object has the following properties:
 * @prop {string} person - The full name of the employee.
 * @prop {number} past12Months - The value for the past 12 months.
 * @prop {number} y2d - The year-to-date value.
 * @prop {number} august - The value for May.
 * @prop {number} june - The value for June.
 * @prop {number} july - The value for July.
 * @prop {number} netEarningsPrevMonth - The net earnings for the previous month.
 */

const tableData: TableDataType[] = (sourceData as unknown as SourceDataType[])
    .filter((dataRow) => dataRow.employees || dataRow.externals) // Filter out rows without employees or externals
    .map((dataRow, index) => {
        const worker = dataRow.employees ? dataRow.employees : dataRow.externals; // simplify Data access

        const person = worker ? `${worker?.firstname} ${worker?.lastname}` : "NaN";
        //------------------------transfer numbers in percentages + if undefined return NaN------------------------

        const LastTwelveMonths = Number(worker?.workforceUtilisation?.utilisationRateLastTwelveMonths) * 100;
        const Y2D = Number(worker?.workforceUtilisation?.utilisationRateYearToDate) * 100;
        const june = Number(worker?.workforceUtilisation?.lastThreeMonthsIndividually?.[2]?.utilisationRate) * 100;
        const july = Number(worker?.workforceUtilisation?.lastThreeMonthsIndividually?.[1]?.utilisationRate) * 100;
        const august = Number(worker?.workforceUtilisation?.lastThreeMonthsIndividually?.[0]?.utilisationRate) * 100;

        //------------------------functions------------------------
      const getPreviousMonth = (): string => {
          //returns previousMonth in "YYYY-MM"
            const today = new Date();
            const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const year = previousMonth.getFullYear();
            const month = String(previousMonth.getMonth() + 1).padStart(2, "0"); // format Month to 2 digits
            return `${year}-${month}`;
        };

      const validateWorkTime = (): boolean => {
          //checks if worker was still working in previous Month
            const end = worker?.costsByMonth?.periods?.[worker.costsByMonth.periods.length - 1]?.end;
            if (end === "null") return true;
            if (end === undefined || end === null) return false;
            const endDate = new Date(end);
            return endDate >= new Date(getPreviousMonth()) ? true : false;
        };

        //------------------------Calculation netEarningsPrevMonth------------------------

        /* IDEA 1:
         **** externals: netEarningsPrevMonth = -monthlySalary
         **** employees: netEarningsPrevMonth = potentialEarningsByMonth - monthlySalary
         */
        const previousMonth = getPreviousMonth();
        let validNetEarningsPrevMonth: number;
        if (dataRow.externals != undefined) {
            //externals
            const monthlySalary =
                worker?.costsByMonth?.periods?.[worker.costsByMonth.periods.length - 1]?.monthlySalary && validateWorkTime()
                    ? worker?.costsByMonth?.periods?.[worker.costsByMonth.periods.length - 1]?.monthlySalary
                    : 0;
            validNetEarningsPrevMonth = -Number(monthlySalary).toFixed(2);
        } else {
            //employees
            const EarningsLastMonth =
                worker?.costsByMonth?.potentialEarningsByMonth?.find((monthData) => monthData.month === previousMonth)?.costs ?? 0;
            const monthlySalary =
                worker?.costsByMonth?.periods?.[worker.costsByMonth.periods.length - 1]?.monthlySalary && validateWorkTime()
                    ? worker?.costsByMonth?.periods?.[worker.costsByMonth.periods.length - 1]?.monthlySalary
                    : 0;
            const netEarningsPrevMonth = Number(EarningsLastMonth) - Number(monthlySalary);
            validNetEarningsPrevMonth = Number(netEarningsPrevMonth.toFixed(2));
        }

        /*--------IDEA 2:-------- 
        netEarningsPrevMonth = monthlyCostDifference
        const netEarningsPrevMonth = worker?.workforceUtilisation?.monthlyCostDifference;
        */

        const row: TableDataType = {
            person: `${person}`,
            past12Months: `${LastTwelveMonths} %`,
            y2d: `${Y2D} %`,
            june: `${june} %`,
            july: `${july} %`,
            august: `${august} %`,
            netEarningsPrevMonth: `${validNetEarningsPrevMonth} EUR`,
        };

        return row;
    });

const Example = () => {
    const columns = useMemo<MRT_ColumnDef<TableDataType>[]>(
        () => [
            {
                accessorKey: "person",
                header: "Person",
            },
            {
                accessorKey: "past12Months",
                header: "Past 12 Months",
            },
            {
                accessorKey: "y2d",
                header: "Y2D",
            },
            {
                accessorKey: "june",
                header: "June",
            },
            {
                accessorKey: "july",
                header: "July",
            },
            {
                accessorKey: "august",
                header: "August",
            },
            {
                accessorKey: "netEarningsPrevMonth",
                header: "Net Earnings Prev Month",
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: tableData,
    });

    return <MaterialReactTable table={table} />;
};

export default Example;
