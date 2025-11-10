// ** React Imports
import { useState, Fragment, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import Collapse from '@mui/material/Collapse'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TableContainer from '@mui/material/TableContainer'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DateType } from 'src/types/forms/reactDatepickerTypes'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { getAllWallet, getPurchased, updateWallet } from 'src/services/wallet.service'
import { Alert, Button, Dialog, DialogTitle, Snackbar, Stack } from '@mui/material'
import { getAllPricing, getPricingList } from 'src/services/pricing.service'
import moment from 'moment'
import Loader from '../extra/Loader'
import CustomTextField from 'src/@core/components/mui/text-field'

const createData = (name: string, calories: number, fat: number, carbs: number, protein: number, price: number) => {
  return {
    name,
    calories,
    fat,
    carbs,
    protein,
    price,
    history: [
      {
        date: '2020-01-05',
        customerId: '11091700',
        amount: 3
      },
      {
        date: '2020-01-02',
        customerId: 'Anonymous',
        amount: 1
      }
    ]
  }
}


const TableCollapsible = () => {
  const [rows, setRow] = useState<any>([])
  const [loader, setLoader] = useState<any>(true)
  useEffect(() => {
    getAllWallet().then((res:any) => {
      if(res.status === 200){
        setRow(res.data.data)
        setLoader(false)
      }
    })
  }, [])



  return (
    <Card>
      <CardHeader title='User Wallet' />
      <Divider />
      <Box
              sx={{
                my: 2,
                mx: 6,
                rowGap: 2,
                columnGap: 4,
                display: 'flex',
                flexDirection: 'row-reverse'
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <CustomTextField
                  // value={value}
                  sx={{ mr: 2 }}
                  id='search wallet'
                  placeholder='Search User'
                  // onChange={e => handleFilter(e.target.value)}
                />
              </Box>
            </Box>
    <TableContainer component={Paper}>
      <Table aria-label='user wallet'>
        <TableHead>
          <TableRow sx={{backgroundColor:"#F6F6F7"}}>
            <TableCell >First Name </TableCell>
            <TableCell >Balance</TableCell>
            <TableCell >Package</TableCell>
            <TableCell align='center'>Purchase Date</TableCell>
            <TableCell align='center'>Package Amount</TableCell>
            <TableCell align='center'>Final Amount</TableCell>
            <TableCell align='center'>Action</TableCell>
            <TableCell align='center'>History</TableCell>
            {/* <TableCell /> */}
          </TableRow>
        </TableHead>
        {loader ? (

          <TableBody>
            <TableRow sx={{height:80}}>
            <TableCell sx={{justifyContent: 'center'}}>
                <Loader/>
            </TableCell>
            </TableRow>
          </TableBody>

        ) : (

        <TableBody>
          {rows.map((row:any, index:any) => (
            <Row key={index} row={row} />
          ))}
        </TableBody>
        )}
      </Table>
    </TableContainer>
    </Card>

  )
}

const Row = (props: { row: any}) => {

  const [open, setOpen] = useState<boolean>(false)
  const { row } : any = props
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false)

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [data, setData] = useState<any[]>([])
  const [price, setPrice] = useState<any[]>([])
  const [loader, setLoader] = useState<any>(true)

  const [updatedData, setUpdatedData] = useState<any[]>([])
  const [handleData, setHandleData] = useState<any[]>([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [color, setColor] = useState<any>('')
  const [defaultRow, setDefaultRow] = useState<{ [rowId: string]: boolean }>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [disable, setDisable] = useState(false)
  const [tableLoader, setTableLoader] = useState(true)
  const [purchase, setPurchase] = useState<[]>([])
  const [name, setName] = useState(null)
  const [editableRows, setEditableRows] = useState<{ [rowId: string]: boolean }>({})
  const [date, setDate] = useState<DateType>(new Date())

  const isEditable = editableRows[row.id] || false
  const isDefault = defaultRow[row.id] || false
  const [selectedPackagePrice, setSelectedPackagePrice] = useState<any>(null)

  const [isDialogOpen1, setIsDialogOpen1] = useState(false)
  const [packages, setPackages] = useState<any>([])
  const handleFirstNameClick1 = () => {
    setIsDialogOpen1(true)
  }
  const selectedPackageData = handleData.find((item: any) => item.userId === row.id)
  const packageAmount = selectedPackageData ? selectedPackageData.price : null
  const finalAmount: any = packageAmount !== null ? Number(packageAmount).toFixed(2) : 'N/A'

  const closeSnackbar = () => {
    setSnackbarOpen(false)
  }

  // const [Datass, setDatass] = useState<any>([])
  // useEffect(()=>{
  //   setDatass([{ userId: row?.id, data: { packageName: selectedPackageData?.name, purchaseDate: date, amount: Number(finalAmount) } }])
  // },[])

  const MyArr: any= []
  MyArr.push({ userId: row?.id, data: { packageName: selectedPackagePrice?.name, purchaseDate: date, amount: Number(finalAmount) } })

  const handleUpdate = (row: any) => {

    updateWallet(MyArr[0]).then(res => {
      if (res.status == 200) {
        setDisable(false)
        setDefaultRow(prevState => ({
          ...prevState,
          [row.id]: true
        }))
        setEditableRows(prevState => ({
          ...prevState,
          [row.id]: false
        }))
        setHandleData([])
        getWalletData()
        setMessage('Wallet updated successfully')
        setColor('success')
        setSnackbarOpen(true)
      } else {
        setMessage(res.data.message)
        setColor('error')
        setSnackbarOpen(true)
      }
    })

    const updatedRow = {
      userId: row.id, // User ID
      packageName: row.selectedPackage, // <Package> Name
      purchaseDate: row.purchaseDate, // Purchase Date
      amount: row.finalAmount // Amount
    }

    setUpdatedData(prevData => [...prevData, updatedRow])
  }
  const [wallet, setWallet] = useState<any>([])

  useEffect(() => {}, [updatedData])

  // const handleFilter = useCallback(
  //   (val: string) => {
  //     setValue(val)

  //     const filteredData = apiData.filter(
  //       (user: any) =>
  //         user.firstName.toLowerCase().includes(val.toLowerCase()) ||
  //         user.lastName.toLowerCase().includes(val.toLowerCase()) ||
  //         user.email.toLowerCase().includes(val.toLowerCase())
  //     )
  //     setData(filteredData)
  //   },
  //   [apiData]
  // )

  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen)

  const getWalletData = () => {
    return getAllWallet().then(res => {
      if (res.status == 200) {
        setLoader(false)
        const arr: any = []
        res.data.data.map((row: any, index: any) => {
          row.key = index
          arr.push(row)

          let arrWallet = wallet
          arrWallet.push({ userId: null, data: { packageName: null, purchaseDate: null, amount: null } })
          setWallet(arrWallet)
        })
        setData(arr)
      }
    })
  }

  const getPriceData = () => {
    return getAllPricing().then((res: any) => {
      if (res.status == 200) {
        setPrice(res.data.data)
      }
    })
  }

  const handlePackageChange = (params: any) => {
    if (handleData.length === 0) {
      handleData.push(params)
      setHandleData(handleData)
    }
    let isExists: boolean = false
    let updatedData: Array<Object>

    const data = handleData?.map(item => {
      if (item?.userId === params.userId) {
        isExists = true
        return params
      }
      return item
    })
    if (!isExists) {
      updatedData = [...data, params]
    }
    setHandleData(!isExists ? updatedData : data)
  }
  useEffect(() => {
    getWalletData()
    getPriceData()
    setWallet([])
  }, [])

  const handleAddButtonClick = (rowId: any) => {
    setEditableRows(prevState => ({
      ...prevState,
      [rowId]: true
    }))
  }

  const handleCellClick = (item: any) => {
    setSelectedPackagePrice(item)
    setIsDialogOpen1(false)
    handlePackageChange({ ...item, userId: row.id })
  }

  const centerTableCell = {
    textAlign: 'center'
  }

  // let arrWallet = wallet;
  //       if (arrWallet[row.key]) {
  //         arrWallet[row.key].userId = row?.id;
  //         arrWallet[row.key].data.packageName = selectedPackagePrice?.name;
  //         setWallet(arrWallet);
  //       } else {
  //         arrWallet[row.key] = {
  //           userId: row?.id,
  //           data: {
  //             packageName: selectedPackagePrice?.name,
  //           },
  //         };
  //         setWallet(arrWallet);
  //       }



  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset', height: 83 }}}>
        <TableCell component='th' scope='row' width={"15%"}>
          <>
            <div>
              <Typography noWrap>{row.firstName}</Typography>
              <Typography noWrap variant='caption'>
                {row.email}
              </Typography>
            </div>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
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
          </>

        </TableCell>

        <TableCell width={"10%"}><Typography noWrap>{row.UserWallet && row.UserWallet.amount ? row.UserWallet.amount : '0'}</Typography></TableCell>

        <TableCell width={"10%"} align='left'>
          {isEditable ? (
              <>
                {selectedPackageData && !isDefault ? (
                  <>
                    {selectedPackageData.name}
                    <IconButton
                      aria-label='close'
                      onClick={() => {
                        handleFirstNameClick1()
                        getPricingList().then(res => {
                          setPackages(res.data.data)
                        })
                      }}
                      color='success'
                    >
                      <Icon icon='material-symbols:change-circle-outline' color='success' />
                    </IconButton>
                  </>
                ) : (
                  <Button
                    variant='contained'
                    onClick={() => {
                      handleFirstNameClick1()
                      getPricingList().then(res => {
                        setPackages(res.data.data)
                      })
                    }}
                    color='success'
                  >
                    Select
                  </Button>
                )}
                <Dialog open={isDialogOpen1} fullWidth maxWidth='md' onClose={() => setIsDialogOpen1(false)}>
                  <DialogTitle variant='h4' sx={{ mb: 2, textAlign: 'center' }}>
                    Packages
                    <IconButton
                      aria-label='close'
                      onClick={() => setIsDialogOpen1(false)}
                      sx={{ position: 'absolute', top: '8px', right: '8px' }}
                    >
                      <Icon icon='charm:cross' color='#786CF1' />
                    </IconButton>
                  </DialogTitle>
                  <Divider />
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 600, mb: 2 }} size='small' aria-label='a dense table'>
                      <TableHead>
                        {/* Render the header row */}
                        {packages && typeof packages === 'object' && Object.keys(packages).length > 0 ? (
                          <>
                            <TableRow>
                              <TableCell colSpan={2}></TableCell>
                              <TableCell colSpan={6} style={centerTableCell}>
                                Estimation of number of persons in sessions
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ textAlign: 'center' }}>Sessions</TableCell>
                              <TableCell>30 min</TableCell>
                              {Object.keys(packages[Object.keys(packages)[0]]).map(index => (
                                <TableCell key={index}>{Number(index) + 1}</TableCell>
                              ))}
                            </TableRow>
                          </>
                        ) : null}
                      </TableHead>
                      <TableBody>
                        {packages && typeof packages === 'object'
                          ? Object.keys(packages).map(sessionKey => (
                              <TableRow key={sessionKey}>
                                <TableCell style={{ textAlign: 'center' }}>{sessionKey}</TableCell>
                                <TableCell>
                                  Local/ <br />
                                  n. Sessions/ <br />
                                  n.Persons
                                  {/* <Typography variant='caption'>Value/session/person</Typography> */}
                                </TableCell>
                                {packages[sessionKey].map((item: any) => (
                                  <TableCell
                                    key={item.id}
                                    onClick={() => handleCellClick(item)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {item.name} <br />
                                    <Typography variant='caption'>{item.price} €</Typography>
                                    <br />
                                    <Typography variant='caption'>{item.perSession} €</Typography>
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Dialog>
              </>
            ) : null}
            </TableCell>

        <TableCell width= "15%" >
          {isEditable ? (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={date}
                  placeholderText='MM/DD/YYYY'
                  selected={date}
                  id='basic-input'
                  onChange={(date: Date) => setDate(date)}
                />
              </LocalizationProvider>
            ) : null}
            </TableCell>

        <TableCell width={"13%"} align='center'> {isEditable ? (
              <Typography noWrap>{selectedPackageData ? selectedPackageData.price : 'N/A'}</Typography>
            ) : null}</TableCell>

        <TableCell width={"12%"} align='center'>{isEditable ? <Typography noWrap>{finalAmount !== null ? finalAmount : 'N/A'}</Typography> : null}</TableCell>

          <TableCell width={"13%"} align='center'>{isEditable ?
             (
              <>
              <Stack direction={'row'} spacing={1} justifyContent={'right'}>
                <Button
                  variant='contained'
                  color='primary'
                  disabled={ finalAmount=="N/A" || disable}
                  onClick={() => {
                    setDisable(true)
                    handleUpdate(row)
                  }}
                >
                  Update
                </Button>
                <IconButton
                  aria-label='cancel'
                  color='error'
                  onClick={() => {
                    setDate(new Date())
                    setDisable(false)
                    setHandleData([])
                    setEditableRows(prevState => ({
                      ...prevState,
                      [row.id]: false
                    }))
                  }}
                >
                  <Icon icon='ic:baseline-cancel' />
                </IconButton>
              </Stack>
            </>
          ) :  (
            <>
            <Stack direction={'row'} spacing={1} justifyContent={'center'}>
              <Button onClick={() => handleAddButtonClick(row.id)} variant='outlined'>
                + Add
              </Button>
            </Stack>
          </>
          )}
          </TableCell>

        <TableCell width={"5%"} align='center'>
          <IconButton aria-label='expand row' size='small' onClick={() =>
          {
            setOpen(!open),
            getPurchased({ userId: row.id }).then(res => {
              if(res.status === 200) {
              setTableLoader(false)
              setPurchase(res.data.message)
              }
            })
          }
        }>
            <Icon icon={open ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
          </IconButton>
        </TableCell>

      </TableRow>
      <TableRow>
        <TableCell colSpan={12} sx={{ py: '0 !important' }}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ m: 2 }}>
              <Typography variant='h5' gutterBottom component='div' color={'#7367F0'}>
                History
              </Typography>
              <Table size='medium' aria-label='purchases' sx={{boxShadow:"1px 1px 2px 1px rgba(0, 0, 0, 0.2)"}}>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Package name</TableCell>
                    <TableCell>Puerchase date</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                {tableLoader ? (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          style={{
                            textAlign: 'center',
                            fontWeight: 'bold',
                            height: '10vh'
                          }}
                        >
                          <Loader />
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableBody>
                        {purchase && purchase.length > 0 ? (
                          purchase.map((row: any, index: any) => (
                            <TableRow key={row.index} sx={{ '&:last-of-type  td, &:last-of-type  th': { border: 0 } }}>
                              <TableCell align='center' component='th' scope='row'>
                                {index + 1}
                              </TableCell>
                              <TableCell align='center'>{row.packageName}</TableCell>
                              <TableCell align='center'>{moment(row.purchaseDate).format('DD-MMM-YYYY')}</TableCell>
                              <TableCell align='center'>{row.amount}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={12}
                              style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                height: '10vh'
                              }}
                            >
                              No Data Available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    )}
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}


export default TableCollapsible
