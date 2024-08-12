import { Box, Grid, TextField } from "@mui/material";

export default function Page() {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(2, 1fr)"
      gridTemplateRows="repeat(1, 1fr)"
      className="min-h-full h-full min-w-full w-full p-0"
    >
      <Box
        id="query-parameters"
        gridColumn="span 1"
        gridRow="span 1"
        className="min-h-full p-1 m-0 bg-green-500 max-h-full overflow-y-auto overflow-x-hidden"
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth />
          </Grid>
        </Grid>
      </Box>
      <Box
        id="query-response"
        gridColumn="span 1"
        gridRow="span 1"
        className="bg-red-500"
      >
        2
      </Box>
    </Box>
  );
}
