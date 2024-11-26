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
        let worker = dataRow.employees ? dataRow.employees : dataRow.externals; // simplify Data acces

        const person = worker ? `${worker?.firstname} ${worker?.lastname}` : "NaN";
        const LastTwelveMonths = Number(worker?.workforceUtilisation?.utilisationRateLastTwelveMonths) * 100;
        const Y2D = Number(worker?.workforceUtilisation?.utilisationRateYearToDate) * 100;
        const june = Number(worker?.workforceUtilisation?.lastThreeMonthsIndividually?.find((e) => e.month === "June")?.utilisationRate) * 100;
        const july = Number(worker?.workforceUtilisation?.lastThreeMonthsIndividually?.find((e) => e.month === "July")?.utilisationRate) * 100;
        const august = Number(worker?.workforceUtilisation?.lastThreeMonthsIndividually?.find((e) => e.month === "August")?.utilisationRate) * 100;

        const netEarningsPrevMonth = Number(worker?.workforceUtilisation?.monthlyCostDifference);

        const row: TableDataType = {
            person: `${person}`,
            past12Months: `${LastTwelveMonths}%`,
            y2d: `${Y2D}%`,
            june: `${june}%`,
            july: `${july}%`,
            august: `${august}%`,
            netEarningsPrevMonth: `${netEarningsPrevMonth} EUR`,
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
