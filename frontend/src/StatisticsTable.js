import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function StatisticsTable(geraeteliste) {
  console.log(geraeteliste);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ width: 1 }} size="medium" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Gerätenummer</TableCell>
            <TableCell align="center">Aktueller Verbrauch in Watt</TableCell>
            <TableCell align="center">Durchschnittsverbrauch in Watt</TableCell>
            <TableCell align="center">Maximalverbrauch in Watt</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {geraeteliste.geraeteliste.map((row, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="center" component="th" scope="row">
                {row.id}
              </TableCell>
              <TableCell align="center">{row.messung.toFixed(2)}</TableCell>
              <TableCell align="center">
                {row.durchschnitt.toFixed(2)}
              </TableCell>
              <TableCell align="center">
                {row.maxverbrauch.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
