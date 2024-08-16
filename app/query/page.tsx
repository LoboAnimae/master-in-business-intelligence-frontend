"use client"
import { Info, Numbers, SettingsApplications } from "@mui/icons-material"
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import { DateTimeField, DateTimePicker } from "@mui/x-date-pickers"
import { DateOrTimeViewWithMeridiem } from "@mui/x-date-pickers/internals"
import { useMutation, useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

type Scheme = {
  id: number
  name: string
}
type Application = {
  id: string
  name: string
}

type Table = {
  id: number
  name: string
  scheme: Scheme
}

type Params = {
  scheme: string
  table: string
  mean_st: number
  std_st: number
  min: number
  max: number
  initial_range: number
  final_range: number
  table_response_size: number
}

export default function Page() {
  const { control, handleSubmit, watch } = useForm()

  const selectedScheme = watch("scheme") ?? ""
  const selectedTable = watch("table") ?? ""
  const selectedApplication = watch("application")
  const selectedHours = watch("hour")

  const shouldFetchParams = !!(selectedScheme && selectedTable)

  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: async (): Promise<{ applications: Application[] }> => {
      const response = await fetch("http://localhost:8000/applications")
      return await response.json()
    },
  })

  const schemesQuery = useQuery({
    queryKey: ["schemes"],
    queryFn: async (): Promise<{ schemes: Scheme[] }> => {
      const response = await fetch("http://127.0.0.1:8000/schemes")
      return await response.json()
    },
  })

  const tablesQuery = useQuery({
    queryKey: ["tables"],
    queryFn: async (): Promise<{ tables: Table[] }> => {
      const response = await fetch("http://127.0.0.1:8000/tables")
      return await response.json()
    },
  })

  const paramsForVariables = useQuery({
    queryKey: ["paramsForVariables", selectedScheme, selectedTable],
    queryFn: async (): Promise<{ params: Params }> => {
      const response = await fetch("http://localhost:8000/get-params", {
        method: "POST",
        body: JSON.stringify({
          scheme: selectedScheme,
          table: selectedTable,
        }),
      })
      return await response.json()
    },
    enabled: shouldFetchParams,
  })

  const getPrediction = useMutation({
    mutationKey: ["getPrediction"],
    mutationFn: async (data: any) => {
      const response = await fetch("http://localhost:8000/predictor", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return await response.json()
    },
  })

  const onSubmit = async (data: any) => {
    const { hour: date, ...rest } = data
    const day = date.day() + 1
    const dayInMonth = date.date()
    const hour = date.hour()
    const submitObj = {
      ...paramsForVariables.data?.params,
      ...rest,
      day,
      dayInMonth,
      hour,
    }

    getPrediction.mutate(submitObj)
  }

  const predictionNumber = getPrediction.data?.prediction
  const minutes = Math.floor(predictionNumber)
  const totalSeconds = Math.floor((predictionNumber - minutes) * 60)

  return (
    <Box display="grid" gridTemplateRows="150px 150px auto" className="min-h-full">

      <Box gridTemplateRows='span 1' className='bg-[#153658] px-10 flex items-center'>
      <Image width={176} height={70} src="/logo_sat_blanco-1.png" alt='logo' title="logo"/>
      </Box>
      <Box gridRow="span 1" className="flex items-center justify-center">
        <Typography
          variant="h3"
          className="text-center text-[#153658]"
          sx={{ fontWeight: 700 }}
        >
          Sistema Preventivo de Consultas Mal Optimizadas
        </Typography>
      </Box>
      <Box
        display="grid"
        gridTemplateColumns="repeat(2, 1fr)"
        gridTemplateRows="repeat(1, 1fr)"
        gridRow="span 1"
        className="h-max min-h-max min-w-full w-full p-0"
      >
        <Box
          id="query-parameters"
          gridColumn="span 1"
          gridRow="span 1"
          className="min-h-half p-10 m-0 max-h-full overflow-y-auto overflow-x-hidden flex justify-center "
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Grid container spacing={2}>
            <Grid item id="application-form" xs={12}>
              <Controller
                name="application"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="application-label" required>
                      Application
                    </InputLabel>
                    <Select
                      disabled={paramsForVariables.isLoading}
                      fullWidth
                      labelId="application-label"
                      label="Application"
                      inputProps={{
                        className: "hover:shadow-lg transition-all",
                      }}
                      {...field}
                    >
                      {applicationsQuery.data?.applications.map(
                        ({ name, id }) => (
                          <MenuItem key={id} value={id}>
                            {name}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item id="scheme-form" xs={12}>
              <Controller
                name="scheme"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="scheme-label" required>
                      Scheme
                    </InputLabel>
                    <Select
                      disabled={paramsForVariables.isLoading}
                      fullWidth
                      labelId="scheme-label"
                      label="Scheme"
                      inputProps={{
                        className: "hover:shadow-lg transition-all",
                      }}
                      {...field}
                    >
                      {schemesQuery.data?.schemes.map(({ id, name }) => (
                        <MenuItem key={name} value={id}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item id="table-form" xs={12}>
              <Controller
                name="table"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="table-label" required>
                      Table
                    </InputLabel>
                    <Select
                      disabled={paramsForVariables.isLoading || !selectedScheme}
                      fullWidth
                      labelId="table-label"
                      label="Table"
                      inputProps={{
                        className: "hover:shadow-lg transition-all",
                      }}
                      {...field}
                    >
                      {tablesQuery.data?.tables
                        ?.filter((table) => {
                          return table.scheme.id === selectedScheme
                        })
                        .map(({ id, name }) => (
                          <MenuItem key={name} value={id}>
                            {name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item id="hour-form" xs={6}>
              <Controller
                name="hour"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <DateTimePicker
                    ampm={false}
                    {...field}
                    className="hover:shadow-lg transition-all"
                  />
                )}
              />
            </Grid>
            {paramsForVariables.data?.params &&
              Object.entries(paramsForVariables.data.params)
                .filter(([key]) => !["scheme", "table"].includes(key))
                .map(([key, value]) => {
                  const keySeparated = key.split("_")
                  const capitalized = keySeparated
                    .map(
                      (word) =>
                        word.charAt(0).toLocaleUpperCase() + word.slice(1)
                    )
                    .join(" ")

                  return (
                    <Grid item xs={6}>
                      <TextField
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="You cannot change this">
                                <Info />
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                        className="hover:shadow transition-all"
                        inputProps={{
                          className: "cursor-not-allowed",
                        }}
                        fullWidth
                        key={key}
                        value={value}
                        disabled
                        label={capitalized}
                      />
                    </Grid>
                  )
                })}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={
                  !(
                    selectedApplication &&
                    selectedTable &&
                    selectedScheme &&
                    selectedHours !== undefined
                  )
                }
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box
          gridColumn="span 1"
          className="bg-[#F2F4F9] flex items-center justify-center border-2 rounded-lg hover:shadow-inner text-center"
        >
          <Typography>
            {getPrediction.status === "success" && (
              <>
                {getPrediction.data?.optimized ? (
                  <>¡Su consulta está optimizada!</>
                ) : (
                  <>
                    ¡Su consulta no está optimizada!
                    <br /> Tiene un tiempo estimado de{" "}<br />
                    <Typography component="span" sx={{ fontWeight: 900 }}>
                      {minutes} minutos y {totalSeconds} segundos.
                    </Typography>{" "}<br />
                    Por favor considerar ejecutarlo en otro horario.
                  </>
                )}
              </>
            )}
            {getPrediction.status === "idle" && (
              <>Sus resultados aparecerán aquí</>
            )}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
