// ** React Imports
import { useState, useEffect, MouseEvent, useCallback, SyntheticEvent } from 'react'

// ** Next Imports
import Link from 'next/link'
import { GetStaticProps, InferGetStaticPropsType } from 'next/types'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Select, { SelectChangeEvent } from '@mui/material/Select'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Actions Imports
import { fetchData, deleteUser } from 'src/store/apps/user'

// ** Third Party Components
import axios from 'axios'

// ** Types Imports
import { RootState, AppDispatch } from 'src/store'
import { CardStatsType } from 'src/@fake-db/types'
import { ThemeColor } from 'src/@core/layouts/types'
import { UsersType } from 'src/types/apps/userTypes'
import { CardStatsHorizontalWithDetailsProps } from 'src/@core/components/card-statistics/types'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/user/list/TableHeader'
import * as source from 'src/views/components/snackbar/SnackbarSourceCode'
import AddUserDrawer from 'src/views/apps/user/list/AddUserDrawer'
import { deleteUsers, getAllUser } from 'src/services/user.service'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Tooltip
} from '@mui/material'
import { C, cl } from '@fullcalendar/core/internal-common'
import CardSnippet from 'src/@core/components/card-snippet'
import { useSettings } from 'src/@core/hooks/useSettings'
import Loader from '../extra/Loader'
import { getAllWallet, getPurchased, updateWallet } from 'src/services/wallet.service'
import { getAllPricing, getPricingList } from 'src/services/pricing.service'
import PickersBasic from 'src/views/forms/form-elements/pickers/PickersBasic'
// import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { parseISO } from 'date-fns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import CustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
import moment from 'moment'

const centerTableCell = {
  textAlign: 'center'
}

const maxWidthTableCell = {
  maxWidth: '80px',
  fontSize: '8px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}

interface UserRoleType {
  [key: string]: { icon: string; color: string }
}

interface UserStatusType {
  [key: string]: ThemeColor
}

interface CellType {
  row: UsersType
}

// ** renders client column
const userRoleObj: UserRoleType = {
  admin: { icon: 'tabler:device-laptop', color: 'secondary' },
  author: { icon: 'tabler:circle-check', color: 'success' },
  editor: { icon: 'tabler:edit', color: 'info' },
  maintainer: { icon: 'tabler:chart-pie-2', color: 'primary' },
  subscriber: { icon: 'tabler:user', color: 'warning' }
}

const userStatusObj: UserStatusType = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}


const UserList = ({ apiData }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [value, setValue] = useState<string>('')
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

  const requestData = {
    userId: '',
    data: {
      packageName: '',
      purchaseDate: '',
      amount: ''
    }
  }

  const closeSnackbar = () => {
    setSnackbarOpen(false)
  }

  const handleUpdate = (row: any) => {
    const data = wallet[row.key]

    updateWallet(data).then(res => {
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

  const handleFilter = useCallback(
    (val: string) => {
      setValue(val)

      const filteredData = apiData.filter(
        (user: any) =>
          user.firstName.toLowerCase().includes(val.toLowerCase()) ||
          user.lastName.toLowerCase().includes(val.toLowerCase()) ||
          user.email.toLowerCase().includes(val.toLowerCase())
      )
      setData(filteredData)
    },
    [apiData]
  )

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
    // setUpdate
    setEditableRows(prevState => ({
      ...prevState,
      [rowId]: true
    }))
  }

  const columns: GridColDef[] = [
    {
      // flex: 0.25,
      minWidth: 230,
      maxWidth: 330,
      field: 'fullName',
      headerName: 'First Name',
      renderCell: ({ row }: { row: any }) => {
        return (
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
        )
      }
    },
    {
      minWidth: 100,
      field: 'balance',
      headerName: 'Balance',
      renderCell: ({ row }: { row: any }) => {
        return <Typography noWrap>{row.UserWallet && row.UserWallet.amount ? row.UserWallet.amount : '0'}</Typography>
      }
    },
    {
      minWidth: 110,
      field: 'package',
      headerName: 'Package',
      renderCell: ({ row, index }: { row: any; index: any }) => {
        const isEditable = editableRows[row.id] || false
        const isDefault = defaultRow[row.id] || false
        const [selectedPackagePrice, setSelectedPackagePrice] = useState<any>(null)

        const [isDialogOpen1, setIsDialogOpen1] = useState(false)
        const [packages, setPackages] = useState<any>([])
        const handleFirstNameClick1 = () => {
          setIsDialogOpen1(true)
        }

        // let arrWallet = wallet
        let arrWallet = wallet; 
        if (arrWallet[row.key]) {
          arrWallet[row.key].userId = row?.id;
          arrWallet[row.key].data.packageName = selectedPackagePrice?.name;
          setWallet(arrWallet);
        } else {
          arrWallet[row.key] = {
            userId: row?.id,
            data: {
              packageName: selectedPackagePrice?.name,
            },
          };
          setWallet(arrWallet);
        }
        // arrWallet[row.key].userId = row?.id
        // arrWallet[row.key].data.packageName = selectedPackagePrice?.name
        // setWallet(arrWallet)
        const handleCellClick = (item: any) => {
          setSelectedPackagePrice(item)
          setIsDialogOpen1(false)
          handlePackageChange({ ...item, userId: row.id })
        }

        return (
          <>
            {isEditable ? (
              <>
                {selectedPackagePrice && !isDefault ? (
                  <>
                    {selectedPackagePrice.name}
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
          </>
        )
      }
    },
    {
      minWidth: 190,
      field: 'purchaseDate',
      headerName: (
        <div>
          <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Purchase</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem' }} align='center'>
            Date
          </Typography>
        </div>
      ),
      renderCell: ({ row }: { row: any }) => {
        const [date, setDate] = useState<DateType>(new Date())
        const isEditable = editableRows[row.id] || false

        // let arrWallet = wallet
        let arrWallet = wallet; 
        if (arrWallet[row.key]) {
          arrWallet[row.key].data.purchaseDate = date;
          setWallet(arrWallet);
        } else {
          arrWallet[row.key] = {
            data: {
              purchaseDate: date,
              // Other properties as needed
            },
          };
          setWallet(arrWallet);
        }
        // arrWallet[row.key].data.purchaseDate = date
        // setWallet(arrWallet)
        return (
          <>
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
          </>
        )
      }
    },
    {
      minWidth: 130,
      field: 'packageAmount',
      headerName: (
        <div>
          <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Package</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem' }} align='center'>
            Amount
          </Typography>
        </div>
      ),
      renderCell: ({ row }: { row: any }) => {
        const isEditable = editableRows[row.id] || false
        const isDefault = defaultRow[row.id] || false

        // const selectedPackageData = price.find((pricing: any) => pricing.price === row.selectedPackagePrice)
        const selectedPackageData = handleData.find((item: any) => item.userId === row.id)

        return (
          <>
            {isEditable ? (
              <Typography noWrap>{selectedPackageData ? selectedPackageData.price : 'N/A'}</Typography>
            ) : null}
          </>
        )
      }
    },
    {
      minWidth: 120,
      field: 'finalAmount',
      headerName: (
        <div>
          <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem' }} align='center'>
            Final
          </Typography>
          <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem' }} align='center'>
            Amount
          </Typography>
        </div>
      ),
      renderCell: ({ row }: { row: any }) => {
        const isEditable = editableRows[row.id] || false
        const isDefault = defaultRow[row.id] || false
        const selectedPackageData = handleData.find((item: any) => item.userId === row.id)

        const balance = row.UserWallet && row.UserWallet.amount ? row.UserWallet.amount : 0
        const packageAmount = selectedPackageData ? selectedPackageData.price : null
        const finalAmount: any = packageAmount !== null ? Number(packageAmount).toFixed(2) : 'N/A'

        // let arrWallet = wallet
        let arrWallet = wallet; 
        if (arrWallet[row.key]) {
          arrWallet[row.key].data.amount = Number(finalAmount);
          setWallet(arrWallet);
        } else {
          arrWallet[row.key] = {
            data: {
              amount: Number(finalAmount),
            },
          };
          setWallet(arrWallet);
        }
        // arrWallet[row.key].data.amount = Number(finalAmount)
        // setWallet(arrWallet)

        return <>{isEditable ? <Typography noWrap>{finalAmount !== null ? finalAmount : 'N/A'}</Typography> : null}</>
      }
    },
    {
      minWidth: 200,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }: { row: any }) => {
        const calculateFinalAmount = (row: any) => {
          const selectedPackageData = handleData.find((item: any) => item.userId === row.id)

          const balance = row.UserWallet && row.UserWallet.amount ? row.UserWallet.amount : 0
          const packageAmount = selectedPackageData ? selectedPackageData.price : null
          if (packageAmount !== null) {
            return (Number(packageAmount) + Number(balance)).toFixed(2)
          }

          return null
        }


        const handleFirstNameClick = () => {
          setIsDialogOpen(true)
        }

        if (editableRows[row.id]) {
          const finalAmount: any = calculateFinalAmount(row) // Calculate the final amount
          const selectedPackageData = handleData.find((item: any) => item.userId === row.id)
          // const isDisabled = finalAmount == 'N/A'
          return (
            <>
              <Stack direction={'row'} spacing={1}>
                <Button
                  variant='contained'
                  color='primary'
                  disabled={!finalAmount || disable}
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
          )
        } else {
          return (
            <>
              <Stack direction={'row'} spacing={1}>
                <Button onClick={() => handleAddButtonClick(row.id)} variant='outlined'>
                  + Add
                </Button>
                <IconButton
                  aria-label='close'
                  disabled={disable}
                  onClick={() => {
                    handleFirstNameClick()
                    setDisable(true)
                    setTableLoader(true)
                    getPurchased({ userId: row.id }).then(res => {
                      setTableLoader(false)
                      setPurchase(res.data.message)
                      setName(row.firstName)
                    })
                  }}
                >
                  <Icon icon='mingcute:history-fill' color='primary' />
                </IconButton>
              </Stack>

              <Dialog open={isDialogOpen} onClose={() => {setName(null);setIsDialogOpen(false);setDisable(false)}}>
                <DialogTitle variant='h4' sx={{ mb: 2, textAlign: 'center' }}>  
                  {name}'s Purchase packages
                  <IconButton
                    aria-label='close'  
                    onClick={() => {setName(null);setIsDialogOpen(false);setDisable(false)}}
                    sx={{ position: 'absolute', top: '8px', right: '8px' }}
                  >
                    <Icon icon='charm:cross' color='#786CF1' />
                  </IconButton>
                </DialogTitle>
                <Divider />
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 600, mb: 2 }} size='small' aria-label='a dense table'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center'>No.</TableCell>
                        <TableCell align='center'>Package Name</TableCell>
                        <TableCell align='center'>Purchase Date</TableCell>
                        <TableCell align='center'>Amount</TableCell>
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
                </TableContainer>
              </Dialog>
            </>
          )
        }
      }
    }
  ]

  return (
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={12}>
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
                  value={value}
                  sx={{ mr: 2 }}
                  id='search wallet'
                  placeholder='Search User'
                  onChange={e => handleFilter(e.target.value)}
                />
              </Box>
            </Box>
            {loader ? (
              <Loader />
            ) : (
              <DataGrid
                autoHeight
                rowHeight={62}
                rows={data}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 25, 50]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
              />
            )}
          </Card>
        </Grid>

        <AddUserDrawer open={addUserOpen} toggle={toggleAddUserDrawer} />
      </Grid>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await getAllWallet()

  const apiData: CardStatsType = res.data.data

  return {
    props: {
      apiData
    }
  }
}

export default UserList
