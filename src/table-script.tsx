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

const tableData: TableDataType[] = (sourceData as unknown as SourceDataType[]).map((dataRow, index) => {
    const person = `${dataRow?.employees?.firstname} ${dataRow?.employees?.lastname}`;
    const LastTwelveMonths = dataRow?.employees?.workforceUtilisation?.utilisationRateLastTwelveMonths;
    const Y2D = dataRow?.employees?.workforceUtilisation?.utilisationRateYearToDate;
    const august = dataRow?.employees?.workforceUtilisation?.lastThreeMonthsIndividually?.filter((e) => e.month === "August")[0]?.utilisationRate;
    const june = dataRow?.employees?.workforceUtilisation?.lastThreeMonthsIndividually?.filter((e) => e.month === "June")[0]?.utilisationRate;
    const july = dataRow?.employees?.workforceUtilisation?.lastThreeMonthsIndividually?.filter((e) => e.month === "July")[0]?.utilisationRate;

    // const netEarningsPrevMonth = dataRow?.employees?.workforceUtilisation?.netEarningsPrevMonth;

    const row: TableDataType = {
        person: `${person}`,
        past12Months: `${LastTwelveMonths}%`,
        y2d: `${Y2D}%`,
        may: `${august}%`,
        june: `${june}%`,
        july: `${july}%`,
        netEarningsPrevMonth: `netEarningsPrevMonth ${index} placeholder`,
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
                accessorKey: "may",
                header: "May",
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
