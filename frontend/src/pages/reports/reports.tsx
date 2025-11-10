import { useState, Fragment, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  Collapse,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  IconButton,
  TableContainer,
  TextField,
  Typography,
  Autocomplete,
  Divider,
  Grid,
  Chip,
  Snackbar,
  Alert,
  MenuItem,
  Select
} from '@mui/material'
import { getAll, getByUserType } from 'src/services/report.services'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import Icon from 'src/@core/components/icon'
import { format } from 'date-fns'
import moment from 'moment'
import Loader from '../extra/Loader'
// import { getByUserType } from 'src/services/user.service'

const centerTableCell = {
  textAlign: 'center'
}
const hideHeaderRow = {
  display: 'none'
}

const Row = ({ row }: any) => {

  const [open, setOpen] = useState<boolean>(false)
  const getColorAndRound = (value: any) => {
    if (isNaN(value)) {
      value = 0
    }

    const roundedValue = Math.round(value * 100) / 100
    const color = value > 0 ? '#28C76F' : '#EA5455'
    return { roundedValue, color }
  }

  return (
    <Fragment>
      <TableRow>
        <TableCell component='th' sx={{ width: '20%', fontWeight: 'bold' }}>
          {row.userName}
        </TableCell>
        <TableCell align='center'>{row.with1}</TableCell>
        <TableCell align='center'>{row.with2}</TableCell>
        <TableCell align='center'>{row.with3}</TableCell>
        <TableCell align='center'>{row.with4}</TableCell>
        <TableCell align='center'>{row.with5}</TableCell>
        <TableCell align='center'>{row.with6}</TableCell>
        <TableCell align='center'>
          <Typography noWrap sx={{ color: '#28C76F', fontWeight: 'medium' }}>
            {getColorAndRound(Number(row.lastMonthBalance)).roundedValue}€
          </Typography>
        </TableCell>
        <TableCell align='center'>
          <Typography noWrap sx={{ color: '#EA5455', fontWeight: 'medium' }}>
            {getColorAndRound(row.userTotalCoast).roundedValue}€
          </Typography>
        </TableCell>
        <TableCell align='center'>
          <Typography noWrap sx={{ color: getColorAndRound(row.walletBalance).color, fontWeight: 'medium' }}>
            {getColorAndRound(row.walletBalance).roundedValue}€
          </Typography>
        </TableCell>
        {/* <TableCell align='center' sx={{ fontWeight: 'bolder' }}>
          <b>
            {row.packages.map((data: any, index: any) =>
              index % 2 === 0 ? <Chip sx={{ my: 1, mx: 1 }} label={data} variant='outlined' /> : <Chip label={data} />
            )}
          </b>
        </TableCell> */}
        <TableCell align='center'>
          <IconButton aria-label='expand row' size='small' onClick={() => setOpen(!open)}>
            <Icon icon={open ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={12} sx={{ py: '0 !important' }}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ m: 2 }}>
              <Typography variant='h6' gutterBottom component='div' color={'#7367F0'}>
                <b>Attendance</b>
              </Typography>
              <Table size='medium' aria-label='purchases'>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: 'auto' }}>Attended With</TableCell>
                    <TableCell align='center'>Count</TableCell>
                    <TableCell align='center'>Package name & <br/> Purchase date</TableCell>
                    <TableCell align='center'>Cost</TableCell>
                    <TableCell align='center'>Total cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(row.attendedWith).map((key, index) => {
                      const firstPart = key.split('_')[0];
                    return (
                    <TableRow key={index}>
                      <TableCell component='th' scope='row'>
                        <b>{firstPart}:</b>
                      </TableCell>
                      <TableCell component='th' align='center' scope='row'>
                        {row.attendedWith[key].count}
                      </TableCell>
                      <TableCell component='th' align='center' scope='row'>
                              {/* {row && row.packages && row.packages.map((data: any, index: any) =>
                                index % 2 === 0 ? <Chip sx={{ my: 1, mx: 1 }} label={data} variant='outlined' /> : <Chip label={data} />
                              )}  */}
                              {row.attendedWith[key].package ? <Chip sx={{ my: 1, mx: 1 }} label={row.attendedWith[key].package} variant='outlined'/>: null}
                                <br/>
                              {moment(row.attendedWith[key].packPurchasedDate).format('DD/MM/YY')}
                      </TableCell>
                      <TableCell component='th' align='center' scope='row'>
                        {(row.attendedWith[key].sessionCost.toString())}
                      </TableCell>
                      <TableCell component='th' align='center' scope='row'>
                        {row.attendedWith[key].totalCost}
                      </TableCell>
                    </TableRow>
                    )
                  }
                  )}

                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

const TableCollapsible = () => {

  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];

  const [manualDatesSelected, setManualDatesSelected] = useState<boolean>(false);

  const getCurrentMonthDates = () => {
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    return { startOfMonth, endOfMonth }

    getAllData(selectedUserId, startOfMonth, endOfMonth);
  }
  const { startOfMonth, endOfMonth } = getCurrentMonthDates()

  const [startDate, setStartDate] = useState<Date | null>(startOfMonth)
  const [endDate, setEndDate] = useState<Date | null>(endOfMonth)

  const handleMonthChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedMonth = event.target.value as number;

    // Calculate start and end dates based on the selected month
    const year = new Date().getFullYear();
    const startOfMonth = new Date(year, selectedMonth, 1);
    const endOfMonth = new Date(year, selectedMonth + 1, 0);

    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
    setManualDatesSelected(false); // Reset manual date selection

    getAllData(selectedUserId, startOfMonth, endOfMonth);

  };

  const [data, setData] = useState<any>([])
  const [loader, setLoader] = useState<any>(true)
  const [user, setUser] = useState<any>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [disable, setDisable] = useState(false)

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [color, setColor] = useState<any>('')

  const closeSnackbar = () => {
    setSnackbarOpen(false)
  }

  const getAllData = (trainerId: number | null = null, startDate: Date | null = null, endDate: Date | null = null) => {

    const reqData: any = { trainer: trainerId }

    if (startDate !== null) {
      reqData.startDate = startDate
    }
    if (endDate !== null) {
      reqData.endDate = endDate
    }
    setDisable(true)
      return getAll(reqData).then(res => {
        if (res.status === 200) {
          setDisable(true)
          setLoader(false)
          setData(res?.data?.data || [])
        }
        setDisable(false)
      }).catch((err) => {
          setMessage(err.response.data.message)
          setColor('error')
          setDisable(true)
          setSnackbarOpen(true)
      })
    }

  const getUserType = () => {
    return getByUserType({ type: 'trainer' }).then(res => {
      if (res.status === 200) {
        setLoader(false)
        setUser(res?.data?.data || [])
      }
    })
  }

  const handleSearchClick = () => {
    if ((!manualDatesSelected && !selectedUserId) || (!manualDatesSelected && (!startDate || !endDate))) {
          setMessage("Select Trainer and Dates");
          setColor('error')
          setSnackbarOpen(true)
          return;
    }else if(!startDate){
          setMessage("Select Start Date")
          setColor('error')
          setSnackbarOpen(true)
    }else if(!endDate){
          setMessage("Select End Date")
          setColor('error')
          setSnackbarOpen(true)
    }else if(selectedUserId && startDate && endDate){
          getAllData(selectedUserId, startDate, endDate);
    }else {
          setMessage("Erorrrrrrrr")
          setColor('error')
          setSnackbarOpen(true)
    }

    getAllData(selectedUserId, startDate, endDate);
  }

  useEffect(() => {
    getUserType()
  }, [])

  const handleUserSelect = (user: any) => {
    if (user) {
      getAllData(user.id, startDate, endDate);
      setSelectedUserId(user.id)
    } else {
      setSelectedUserId(null)
    }
  }



  return (
    <>
    <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          variant='filled'
          severity={color}
          onClose={closeSnackbar}
          sx={{ width: '100%' }}
          // elevation={skin === 'bordered' ? 0 : 3}
        >
          {message}
        </Alert>
      </Snackbar>

    <TableContainer component={Paper}>
      <TableHead>
        <Typography variant='h4' sx={{ mt: 4, ml: 5, mb: 3}}>
          Reports
        </Typography>
      </TableHead>
        <Divider/>
      <Grid
        container
        alignItems='center'
        spacing={2}
        sx={{mr:2, my:4, marginLeft:{lg:5, md:5, sm:0, xs:0}}}
      >
        <Grid item xs={11} sm={9} md={2.8} lg={2.8} sx={{marginRight:{lg:3, sm:2, xs:2}}} >
          <Autocomplete
            options={user}
            id='autocomplete-outlined'
            getOptionLabel={(option: any) => `${option.firstName} ${option.lastName}` || ''}
            renderInput={params => <TextField {...params} label='Personal Trainer' />}
            noOptionsText='No Users available'
            onChange={(event, newValue) => handleUserSelect(newValue)}
          />
        </Grid>
        <Grid item xs={4.7} sm={3.5} md={2} lg={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              timezone={'UTC'}
              label='Start Date'
              format="dd/MM/yyyy"
              value={startDate}
              // onChange={(date: any) => {setStartDate(date);setEndDate(null)}}
              onChange={(date: any) => {
                setStartDate(date);
                setEndDate(null);
                setManualDatesSelected(true); // User manually selected date
              }}
              renderInput={(params: any) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={4.9} sm={3} md={2} lg={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              timezone={'UTC'}
              label='End Date'
              format="dd/MM/yyyy"
              value={endDate}
              // onChange={(date: any) => setEndDate(date)}
              onChange={(date: any) => {
                setEndDate(date);
                setManualDatesSelected(true); // User manually selected date
              }}
              minDate={startDate}
              renderInput={(params: any) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Grid>
        {manualDatesSelected ? (
        <Grid item xs={1} sm={4 } md={2.5} lg={3}     >
            <IconButton
                  aria-label='close'
                  onClick={handleSearchClick}
                  // disabled={disable || !startDate || !endDate || !selectedUserId}
                  // style={{ border: '1px solid gray', boxShadow: disable || !startDate || !endDate || !selectedUserId ? '': '4px 6px 6px rgba(0, 0, 0, 0.2)'}}
                  style={{ border: '1px solid gray', boxShadow:  '4px 6px 6px rgba(0, 0, 0, 0.2)'}}
                  color='primary'

                >
                  <Icon icon='teenyicons:search-outline' color='primary' />
            </IconButton>
        </Grid>
      ) : null
      }
        <Grid item xs={5.9} sm={2.5} md={2} lg={1.5}>
        <Select
          value={manualDatesSelected ? "manual" : endDate?.getMonth()}
          onChange={handleMonthChange }
          displayEmpty
          // placeholder={manualDatesSelected ? 'Select': "aaaa"}
          inputProps={{ 'aria-label': 'Select month' }}
        >
          <MenuItem value='' disabled>
            Select Month
          </MenuItem>
          <MenuItem value='manual' sx={{display:'none'}}>
            Manual date
          </MenuItem>
          {months.map((month) => (
            <MenuItem key={month.value} value={month.value}>
              {month.label}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      </Grid>
      <Divider />

      <Table title='Reports'>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell colSpan={6}>
              <TableRow>
                <TableCell colSpan={6} style={centerTableCell} >
                  Persons in sessions
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell width={'20%'}>1</TableCell>
                <TableCell width={'20%'}>2</TableCell>
                <TableCell width={'20%'}>3</TableCell>
                <TableCell width={'22%'}>4</TableCell>
                <TableCell width={'25%'}>5</TableCell>
                <TableCell width={'20%'}>6</TableCell>
                {/* <TableCell align='center' colSpan={1}></TableCell> */}
              </TableRow>
            </TableCell>
            <TableCell align='center'>Credits From <br/>Previous Month</TableCell>
            <TableCell align='center' colSpan={1}>
              Spent
            </TableCell>
            <TableCell align='center' colSpan={1}>
              Credits For <br/> Next Month
            </TableCell>
            {/* <TableCell align='center' colSpan={1}>
              Which Pack You Have Used
            </TableCell> */}
            <TableCell align='center'>Details</TableCell>
          </TableRow>
        </TableHead>


        <TableBody>
          {data.length > 0 ? (
            data.map((row: any) => <Row key={row.name} row={row} />)
          ) : (
            <TableRow>
              {loader ?
            <TableCell
            colSpan={12}
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              height: '20vh'
            }}>
                <Loader/>
            </TableCell>
        :
              <TableCell
                colSpan={12}
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  height: '20vh'
                }}
              >
                No Data Available
              </TableCell>
}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  )
}

export default TableCollapsible
