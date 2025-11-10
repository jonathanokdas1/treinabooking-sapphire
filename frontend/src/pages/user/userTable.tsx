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
import { SelectChangeEvent } from '@mui/material/Select'

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
  Tooltip
} from '@mui/material'
import { cl } from '@fullcalendar/core/internal-common'
import CardSnippet from 'src/@core/components/card-snippet'
import { useSettings } from 'src/@core/hooks/useSettings'
import Loader from '../extra/Loader'
import { useRouter } from 'next/router'

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

// ** renders client column
// const renderClient = (row: UsersType) => {
//   if (row.avatar.length) {
//     return <CustomAvatar src={row.avatar} sx={{ mr: 2.5, width: 38, height: 38 }} />
//   } else {
//     return (
//       <CustomAvatar
//         skin='light'
//         color={row.avatarColor}
//         sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
//       >
//         {getInitials(row.fullName ? row.fullName : 'John Doe')}
//       </CustomAvatar>
//     )
//   }
// }

const RowOptions = ({ id }: { id: number | string }) => {
  // ** Hooks
  const dispatch = useDispatch<AppDispatch>()

  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const rowOptionsOpen = Boolean(anchorEl)

  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleRowOptionsClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton size='small' onClick={handleRowOptionsClick}>
        <Icon icon='tabler:dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        {/* <MenuItem
          component={Link}
          sx={{ '& svg': { mr: 2 } }}
          href='/apps/user/view/account'
          onClick={handleRowOptionsClose}
        >
          <Icon icon='tabler:eye' fontSize={20} />
          View
        </MenuItem> */}
        <MenuItem component={Link} href='/user/addUser' sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:edit' fontSize={20} />
          Edit
        </MenuItem>
        {/* <MenuItem onClick={'handleDelete'} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:trash' fontSize={20} />
          Delete
        </MenuItem> */}
      </Menu>
    </>
  )
}

const UserList = ({ apiData }: InferGetStaticPropsType<typeof getStaticProps>) => {
  // ** State
  const [role, setRole] = useState<string>('')
  const [plan, setPlan] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [color, setColor] = useState<any>('')
  const [disable, setDisable] = useState(false)

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.user)

  useEffect(() => {
    dispatch(
      fetchData({
        role,
        status,
        q: value,
        currentPlan: plan
      })
    )
  }, [dispatch, plan, role, status, value])

  const handleFilter = useCallback(
    (val: string) => {
      setValue(val)

      const filteredData = apiData.filter(
        (user: any) =>
          user.firstName.toLowerCase().includes(val.toLowerCase()) ||
          user.lastName.toLowerCase().includes(val.toLowerCase()) ||
          user.email.toLowerCase().includes(val.toLowerCase()) ||
          user.type.toLowerCase().includes(val.toLowerCase()) ||
          user.mobile.toLowerCase().includes(val.toLowerCase())
      )

      // Set the filtered data to the state
      setData(filteredData)
    },
    [apiData]
  )

  const handleRoleChange = useCallback((e: SelectChangeEvent<unknown>) => {
    setRole(e.target.value as string)
  }, [])

  const handlePlanChange = useCallback((e: SelectChangeEvent<unknown>) => {
    setPlan(e.target.value as string)
  }, [])

  const handleStatusChange = useCallback((e: SelectChangeEvent<unknown>) => {
    setStatus(e.target.value as string)
  }, [])

  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen)

  const [data, setData] = useState<any[]>([])
  const [loader, setLoader] = useState<any>(true)

  const getUserData = () => {
    setLoader(true)
    setData([])
    return getAllUser().then(res => {
      if (res.status == 200) {
        setLoader(false)
        setData(res.data.data)
      }
    })
  }

  useEffect(() => {
    getUserData()
  }, [])

  const router = useRouter()
  const handleEditUser = (userId: any) => {
    setDisable(true)
    router.push(`/user/addUser?userId=${userId}`)
  }

  const columns: GridColDef[] = [
    {
      // flex: 0.25,
      minWidth: 150,
      field: 'fullName',
      headerName: 'First Name',
      renderCell: ({ row }: { row: any }) => {
        return <Typography noWrap>{row.firstName}</Typography>
      }
    },
    {
      // flex: 0.25,
      minWidth: 150,
      field: 'lastName',
      headerName: 'Last Name',
      renderCell: ({ row }: { row: any }) => {
        return <Typography noWrap>{row.lastName}</Typography>
      }
    },
    {
      minWidth: 120,
      field: 'type',
      headerName: 'Type',
      renderCell: ({ row }: { row: any }) => {
        return <Typography noWrap>{row && row.type}</Typography>
      }
    },
    {
      minWidth: 350,
      field: 'email',
      headerName: 'Email',
      renderCell: ({ row }: { row: any }) => {
        return <Typography noWrap>{row.email}</Typography>
      }
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'mobile',
      headerName: 'Mobile',
      renderCell: ({ row }: { row: any }) => {
        return <Typography noWrap>{row.mobile}</Typography>
      }
    },
    {
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }: { row: any }) => {
        const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
        const [userToDelete, setUserToDelete] = useState<any>(null)

        const openDeleteDialog = (user: any) => {
          setUserToDelete(user)
          setDeleteDialogOpen(true)
        }

        const closeDeleteDialog = () => {
          setUserToDelete(null)
          setDeleteDialogOpen(false)
        }
        const closeSnackbar = () => {
          setSnackbarOpen(false)
        }
        return (
          <>
            <Dialog
              open={deleteDialogOpen}
              onClose={closeDeleteDialog}
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'
            >
              <DialogTitle id='alert-dialog-title' variant='h5' textAlign={'center'}>
                <b>Confirm Deletion</b>
              </DialogTitle>
              <DialogContent>
                <DialogContentText textAlign={'center'} id='alert-dialog-description'>
                  Are you sure you want to delete this user?
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={closeDeleteDialog} variant='outlined' color='primary'>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (userToDelete) {
                      deleteUsers({ userId: userToDelete.id }).then(res => {
                        if (res.status == 200) {
                          setMessage('User deleted successfully')
                          setColor('success')
                          setSnackbarOpen(true)
                          getUserData()
                        }
                      })
                    }
                    closeDeleteDialog()
                  }}
                  color='error'
                  variant='contained'
                  autoFocus
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
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

            <IconButton
              size='small'
              color='primary'
              disabled={disable}
              onClick={() => {
                handleEditUser(row.id) 
              }}
            >
              <Icon icon='tabler:edit' />
            </IconButton>
            <IconButton
              size='small'
              color='error'
              onClick={() => {
                openDeleteDialog(row)
              }}
            >
              <Icon icon='tabler:trash' />
            </IconButton>
          </>
        )
      }
    }
  ]

  return (
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='User Table' />
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
                  placeholder='Search User'
                  onChange={e => handleFilter(e.target.value)}
                />

                <Button component={Link} href='/user/addUser' variant='contained' sx={{ '& svg': { mr: 2 }, marginTop:{xs: 2, sm:2, md:0, lg:0}}}>
                  <Icon fontSize='1.125rem' icon='tabler:plus' />
                  Add New User
                </Button>
              </Box>
            </Box>
            {loader ? (
              <Grid item xs={12} sx={{my:40}}>
              <Loader />
              </Grid>
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
  const res = await getAllUser()

  const apiData: CardStatsType = res.data.data

  return {
    props: {
      apiData
    }
  }
}

export default UserList
