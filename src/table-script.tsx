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
 * @prop {number} may - The value for May.
 * @prop {number} june - The value for June.
 * @prop {number} july - The value for July.
 * @prop {number} netEarningsPrevMonth - The net earnings for the previous month.
 */

const tableData: TableDataType[] = (sourceData as unknown as SourceDataType[])
    .filter((dataRow) => dataRow.employees || dataRow.externals) // Filter out rows without employees or externals
    .map((dataRow, index) => {
        const worker = dataRow.employees ? dataRow.employees : dataRow.externals; // simplify Data access

        const person = worker ? `${worker?.firstname} ${worker?.lastname}` : "NaN";

        //transfer numbers in percentages + if undefined return NaN
        const LastTwelveMonths = Number(worker?.workforceUtilisation?.utilisationRateLastTwelveMonths) * 100;
        const Y2D = Number(worker?.workforceUtilisation?.utilisationRateYearToDate) * 100;
        const june = Number(worker?.workforceUtilisation?.lastThreeMonthsIndividually?.[2]?.utilisationRate) * 100;
        const july = Number(worker?.workforceUtilisation?.lastThreeMonthsIndividually?.[1]?.utilisationRate) * 100;
        const august = Number(worker?.workforceUtilisation?.lastThreeMonthsIndividually?.[0]?.utilisationRate) * 100;

        const getPreviousMonth = (): string => {
            const today = new Date();
            const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const year = previousMonth.getFullYear();
            const month = String(previousMonth.getMonth() + 1).padStart(2, "0"); // format Month to 2 digits
            return `${year}-${month}`;
        };

        const validateDate = (): boolean => {
            const end = worker?.costsByMonth?.periods?.[worker.costsByMonth.periods.length - 1]?.end
                ? new Date(worker.costsByMonth.periods[worker.costsByMonth.periods.length - 1].end)
                : false;
            console.log(end);
            console.log(end >= new Date(getPreviousMonth()));
            return end >= new Date(getPreviousMonth()) || end === null ? true : false;
        };

        const previousMonth = getPreviousMonth();
        //--------Calculation netEarningsPrevMonth--------
        // Idea: NetEarningsPrevMonth = potentialearningsByMonth - monthlySalary
        let validNetEarningsPrevMonth: number;
        //check if external or employee
        if (dataRow.externals != undefined) {
            const monthlySalary =
                worker?.costsByMonth?.periods?.[worker.costsByMonth.periods.length - 1]?.monthlySalary && validateDate()
                    ? worker?.costsByMonth?.periods?.[worker.costsByMonth.periods.length - 1]?.monthlySalary
                    : 0;
            const previousMonthData = worker?.costsByMonth?.costsByMonth?.find((monthData) => monthData.month === previousMonth)?.costs ?? 0;
            validNetEarningsPrevMonth = Number(previousMonthData) - Number(monthlySalary);
        } else {
            const EarningsLastMonth =
                worker?.costsByMonth?.potentialEarningsByMonth?.find((monthData) => monthData.month === previousMonth)?.costs ?? 0;
            const monthlySalary = worker?.statusAggregation?.monthlySalary ?? 0;
            const netEarningsPrevMonth = EarningsLastMonth ? Number(EarningsLastMonth) - Number(monthlySalary) : Number(EarningsLastMonth);
            validNetEarningsPrevMonth = isNaN(netEarningsPrevMonth) ? 0 : netEarningsPrevMonth;
        }
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
