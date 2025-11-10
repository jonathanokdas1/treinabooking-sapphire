// ** React Imports
import { useState, useEffect, forwardRef, useCallback, SetStateAction } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import SignatureCanvas from 'react-signature-canvas'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { AddEventSidebarType, EventDateType } from 'src/types/apps/calendarTypes'
import { getAllUser } from 'src/services/user.service'
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Snackbar, Stack } from '@mui/material'
import { addAttendance, getAllAttendance, getOneAttendance } from 'src/services/attendance.service'
import { useSelector } from 'react-redux'
import { checkWallet } from 'src/services/wallet.service'
import moment from 'moment'
import dayjs from 'dayjs'
import {
  addBooking,
  checkToken,
  getAllBookings,
  getOneBooking,
  googleAuth,
  updateTheBooking
} from 'src/services/booking.service'
import Loader from '../extra/Loader'

interface PickerProps {
  label?: string
  error?: boolean
  registername?: string
}

var defaultState: any = {
  title: '',
  userCount: '',
  trainer: '',
  users: Array().fill(''),
  startDate: new Date(),
  endDate: new Date(),
  allDay: true,
  description: '',
  interval: '',
  signature: Array().fill('')
}
const defaultStates = defaultState

type FormData = typeof defaultState

const AddAttendenceSidebar = (props: AddEventSidebarType) => {
  const [booking, setBooking] = useState(true)
  const [selectedUserCount, setSelectedUserCount] = useState<any>(0)
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  const [values, setValues] = useState<any>(defaultState)
  const [trainer, setTrainer] = useState<FormData[]>([])
  const [userOptions, setUserOptions] = useState<FormData[]>([])
  // const { id }: { id: string | null } = useSelector((state: any) => state.calendar.selectedEvent)
  const selectedEvent = useSelector((state: any) => state && state?.calendar?.selectedEvent)
  const session: any | null = selectedEvent ? selectedEvent : null

  const [updateAttendence, setUpdateAttendence] = useState<any>()
  const [updateBooking, setUpdateBooking] = useState<any>(null)
  const [startDate, setStartDate] = useState<any>(dayjs())
  const [timeInterval, setTimeInterval] = useState('30')
  const [endDate, setEndDate] = useState<any>(dayjs())
  const [loader, setLoader] = useState(true)

  useEffect(() => {
    const intervalInMinutes = parseInt(timeInterval)
    if (!isNaN(intervalInMinutes)) {
      const newEndDate = startDate.add(intervalInMinutes, 'minute')
      setEndDate(newEndDate)
    }
  }, [startDate, timeInterval])

  const handleUserDelete = (indexToDelete: number) => {
    // Create a copy of selectedUsers without the user to be deleted
    const updatedSelectedUsers = selectedUsers.filter((_, index) => index !== indexToDelete)

    // Create a copy of userSignatures without the user's signature to be deleted
    const updatedUserSignatures = userSignatures.filter((_, index) => index !== indexToDelete)

    // Update selectedUsers and userSignatures
    setSelectedUsers(updatedSelectedUsers)
    setUserSignatures(updatedUserSignatures)

    // Update the user count
    handleUserCountChange(updatedSelectedUsers.length)

    // Update the Formik values (users and signature arrays)
    setValue('users', updatedSelectedUsers)
    setValue('signature', updatedUserSignatures)
  }

  const {
    store,
    dispatch,
    addEvent,
    updateEvent,
    drawerWidth,
    calendarApi,
    deleteEvent,
    handleSelectEvent,
    addEventSidebarOpen,
    handleAddEventSidebarToggle
  } = props

  const {
    control,
    setValue,
    clearErrors,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({ defaultValues: defaultState })

  const getTrainerData = () => {
    return getAllUser().then(res => {
      if (res.status == 200) {
        const trainerUsers = res.data.data.filter((user: any) => user.type === 'trainer')
        setTrainer(trainerUsers)
        setLoader(false)
      }
    })
  }

  const getUserData = () => {
    return getAllUser().then(res => {
      if (res.status == 200) {
        const studentUsers = res.data.data.filter((user: any) => user.type === 'student')
        setUserOptions(studentUsers)
        setLoader(false)
      }
    })
  }

  const updateData = () => {
    if (session?.extendedProps?.calendar === 'Family') {
      return getOneBooking({ bookingId: session.id }).then((res: any) => {
        setUpdateBooking(res.data.data)
      })
    } else if (session?.extendedProps?.calendar === 'Business') {
      return getOneAttendance({ attendanceId: session.id }).then((res: any) => {
        setUpdateAttendence(res.data.data)
      })
    }
  }

  useEffect(() => {
    getUserData()
    getTrainerData()

    if (session?.id) {
      updateData()
    }
  }, [session?.id])

  // ================================
  const [userSignatures, setUserSignatures] = useState<Array<string>>(new Array(selectedUserCount).fill(''))
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [currentUserForSignature, setCurrentUserForSignature] = useState<any>(null)
  const [disable, setDisable] = useState(false)

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [color, setColor] = useState<any>('')

  const closeSnackbar = () => {
    setSnackbarOpen(false)
  }

  let canvasRef: { isEmpty: () => any; toDataURL: () => SetStateAction<any> }

  const handleSignButtonClick = (userIndex: any) => {
    setCurrentUserForSignature(userIndex)
    setShowSignatureDialog(true)
  }

  const handleSignatureSave = (signatureData: string) => {
    const signs = values.signature ? values.signature : []
    const updatedSignatures = [...signs]

    if (currentUserForSignature !== null) {
      updatedSignatures[currentUserForSignature] = signatureData
      setUserSignatures(updatedSignatures)
    }
    setShowSignatureDialog(false)

    // Update the signature array in formik.values
    const signs1 = values.signature ? values.signature : []
    const updatedSignatureArray: any = [...signs1]
    updatedSignatureArray[currentUserForSignature] = signatureData
    setValue('signature', updatedSignatures)
    values.signature = updatedSignatures
  }

  const resetUserCountAndSelectedUsers = () => {
    setSelectedUserCount(0)
    setSelectedUserCount(0)
    setSelectedUsers([])
    setUserSignatures([])
  }

  const handleSidebarClose = async () => {
    setValue('title', '')
    clearErrors()
    reset(defaultStates)
    dispatch(handleSelectEvent(null))
    handleAddEventSidebarToggle()
    setUpdateAttendence([])
    setUpdateBooking(null)
    resetUserCountAndSelectedUsers()
    setStartDate(dayjs())
    setEndDate(dayjs())
    setBooking(true)
    setUpdateBooking(null)
    setTimeInterval('30')
    setDisable(false)
  }

  const handleUserCountChange = (newUserCount: number) => {
    setSelectedUserCount(newUserCount)
    setSelectedUserCount(newUserCount)
    // Resize the signatures array to match the new user count
    const updatedSignatures = [...userSignatures]
    updatedSignatures.length = newUserCount
    setUserSignatures(updatedSignatures)
  }

  const onSubmit = (data: any) => {
    setDisable(true)
    const bookingData = {
      ...(updateBooking && updateBooking.id ? { bookingId: updateBooking.id } : {}),
      title: data.title,
      endDate: endDate.toISOString(),
      startDate: startDate.toISOString(),
      trainer: values.trainer,
      createdBy: values.trainer,
      userCount: '' + selectedUserCount,
      users: selectedUsers.map(userId => ({ id: userId }))
    }

    const modifiedEvent = {
      bookingId: updateBooking && updateBooking.id ? updateBooking.id : null,
      title: data.title,
      endDate: endDate.toISOString(),
      startDate: startDate.toISOString(),
      trainer: values.trainer,
      createdBy: values.trainer,
      interval: timeInterval,
      userCount: '' + values.userCount,
      users: { id: values.users, sign: values.signature }
    }
    let arr: any = []

    if (booking) {
      if (updateBooking && updateBooking.id) {
        const updateBookings = () => {
          updateTheBooking(bookingData)
            .then((res: any) => {
              setDisable(true)
              if (res.status == 200) {
                setDisable(false)
                setBooking(false)
                handleSidebarClose()
                getAllBookings()
                window.location.reload()
                setMessage('Booking updated successfully')
                setColor('success')
                setSnackbarOpen(true)
              }
            })
            .catch(err => {
              setMessage(err.response.data.message)
              setColor('error')
              setSnackbarOpen(true)
            })
        }
        checkToken().then(res => {
          if (res.data.message !== 'Token has expired.') {
            updateBookings()
          } else {
            setMessage(res.data.message)
            setColor('error')
            setSnackbarOpen(true)
            googleAuth().then(res1 => {
              window.open(res1.data.url, '_blank')
            })
          }
        })
      } else {
        const addBookings = () => {
          addBooking(bookingData)
            .then(res => {
              setDisable(true)
              if (res.status == 200) {
                setDisable(false)
                handleSidebarClose()
                window.location.reload()
                getAllBookings()
                setBooking(false)
                setMessage('Booking done successfully')
                setColor('success')
                setSnackbarOpen(true)
              }
            })
            .catch(err => {
              setMessage(err.response.data.message)
              setColor('error')
              setDisable(false)
              setSnackbarOpen(true)
            })
        }
        checkToken().then((res: any) => {
          if (res.data.message !== 'Token has expired.') {
            addBookings()
            setDisable(false)
          } else {
            setMessage(res.data.message)
            setColor('error')
            setDisable(false)
            setSnackbarOpen(true)
            googleAuth().then((res1: any) => {
              window.open(res1.data.url, '_blank')
            })
          }
        })
      }
    } else {
      modifiedEvent?.users?.id?.map((data: any, index: any) => {
        arr.push({ id: data, sign: modifiedEvent?.users?.sign[index] })
      })

      modifiedEvent.users = arr
      addAttendance(modifiedEvent)
        .then(res => {
          setDisable(true)
          if (res.status === 200) {
            setDisable(false)
            handleSidebarClose()
            window.location.reload()
            getAllBookings()
            getAllAttendance()
            setMessage('Attendance added successfully')
            setColor('success')
            setSnackbarOpen(true)
          }
        })
        .catch(error => {
          setMessage(error.response.data.message)
          setColor('error')
          setSnackbarOpen(true)
          setDisable(false)
        })
    }
  }

  const handleStartDate = (date: Date) => {
    if (date > values.endDate) {
      setValues({ ...values })
    }
  }

  const resetToStoredValues = useCallback(() => {
    if ((updateBooking && updateBooking.id) || (updateAttendence && updateAttendence.id)) {
      const event: any = store?.selectedEvent
      // if (updateBooking && updateBooking.id) {
      defaultState = {
        ...(updateBooking && updateBooking.id ? { title: updateBooking?.title } : { title: updateAttendence?.title }),
        users: updateBooking?.extendedProps.guests.map((user: any) => user.id) || [],
        ...(updateBooking && updateBooking.id
          ? { userCount: updateBooking?.extendedProps.guests.length }
          : { userCount: updateAttendence?.extendedProps.guests.userCount }),
        description: event?.description || '',
        ...(updateBooking && updateBooking.id
          ? { trainer: updateBooking?.trainer.id }
          : { trainer: updateAttendence?.trainer.id }),
        ...(updateBooking && updateBooking.id
          ? { endDate: setEndDate(dayjs(updateBooking.end)) }
          : { endDate: setEndDate(dayjs(updateAttendence.end)) }),
        ...(updateBooking && updateBooking.id
          ? { startDate: setStartDate(dayjs(updateBooking.start)) }
          : { startDate: setStartDate(dayjs(updateAttendence.start)) })
      }
      setValue('title', defaultState.title)
      setValues(defaultState)
      setSelectedUserCount(
        updateAttendence && updateAttendence.id
          ? updateAttendence?.extendedProps.guests.userCount
          : updateBooking && updateBooking?.extendedProps
            ? updateBooking?.extendedProps.guests.length
            : 0
      )
      // setSelectedUserCount(updateAttendence?.extendedProps.guests.userCount || 0)
      // setSelectedUsers(updateBooking?.extendedProps.guests.map((user: any) => user.id) || [])
      setSelectedUsers(
        updateAttendence && updateAttendence.id
          ? updateAttendence?.extendedProps.guests.users.map((user: any) => user.id)
          : updateBooking && updateBooking?.extendedProps
            ? updateBooking?.extendedProps.guests.map((user: any) => user.id)
            : []
      )
      setUserSignatures(
        updateAttendence && updateAttendence?.extendedProps
          ? updateAttendence?.extendedProps.guests.users.map((user: any) => user.sign)
          : []
      )
      // }
    } else {
      setValues(null)
    }
  }, [setValue, store?.selectedEvent, updateBooking, updateAttendence])

  const resetToEmptyValues = useCallback(() => {
    setValues(defaultState)
    setSelectedUserCount(0)
    setUserSignatures([])
    setStartDate(dayjs())
    setEndDate(dayjs())
    setBooking(true)
    setTimeInterval('30')
  }, [setValue])

  useEffect(() => {
    if (store?.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
      setSelectedUsers([])
      setSelectedUserCount(0)
      setUserSignatures([])
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, store?.selectedEvent])

  const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
    return (
      <CustomTextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        sx={{ width: '100%' }}
        error={props.error}
      />
    )
  })
  const RenderSidebarFooter = () => {
    if (updateBooking && updateBooking.id) {
      return (
        <>
          {booking ? (
            <>
              {selectedUserCount < 1 ? null : (
                <Button
                  type='submit'
                  variant='contained'
                  sx={{ mr: 4 }}
                  disabled={selectedUserCount !== selectedUsers.length}
                >
                  Update
                </Button>
              )}
              <Button
                variant='contained'
                color='secondary'
                onClick={() => {
                  handleSidebarClose()
                }}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                color='success'
                sx={{ ml: 4 }}
                disabled={selectedUserCount !== selectedUsers.length}
                onClick={() => {
                  setBooking(false)
                }}
              >
                Finished Session
              </Button>
            </>
          ) : (
            <>
              <Button
                type='submit'
                variant='contained'
                sx={{ mr: 4 }}
                disabled={
                  values.userCount !== values?.signature?.length || values.signature.some((val: any) => val === null || disable)
                }
              // onClick={onSubmit}
              >
                End Session
              </Button>
              <Button
                variant='contained'
                color='secondary'
                onClick={() => {
                  setBooking(true)
                  setUpdateAttendence([])
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </>
      )
    } else if (updateAttendence && updateAttendence.id) {
      return null
    } else {
      return (
        <>
          {selectedUserCount < 1 ? null : (
            <Button
              type='submit'
              variant='contained'
              sx={{ mr: 4 }}
              disabled={selectedUserCount !== selectedUsers.length || disable}
            >
              Add
            </Button>
          )}
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              resetToEmptyValues()
              resetUserCountAndSelectedUsers()
            }}
          >
            Reset
          </Button>
        </>
      )
    }
  }

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert variant='filled' severity={color} onClose={closeSnackbar} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>

      <Drawer
        anchor='right'
        open={addEventSidebarOpen}
        onClose={handleSidebarClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] } }}
      >
        {loader ? (
          <Stack textAlign={'center'} mt={7}>
            <Loader />
          </Stack>
        ) : (
          <>
            <Box
              className='sidebar-header'
              sx={{
                px: 6,
                pt: 6,
                pb: 3,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant='h4'>
                {updateBooking && updateBooking.id
                  ? 'Update Booking'
                  : updateAttendence && updateAttendence.id
                    ? 'Attendance Details'
                    : 'Add Booking'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size='small'
                  onClick={handleSidebarClose}
                  sx={{
                    p: '0.375rem',
                    borderRadius: 1,
                    color: 'text.primary',
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
                    }
                  }}
                >
                  <Icon icon='tabler:x' fontSize='1.25rem' />
                </IconButton>
              </Box>
            </Box>

            <Box className='sidebar-body' sx={{ p: theme => theme.spacing(0, 6, 6) }}>
              <DatePickerWrapper>
                <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>

                  <Controller
                    name='title'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => {
                      return (
                        <CustomTextField
                          fullWidth
                          label='Title'
                          disabled={!booking || (updateAttendence && updateAttendence.id)}
                          value={value ? value : updateBooking?.id ? values?.title : ''}
                          sx={{ mb: 4 }}
                          defaultValue={updateBooking?.id ? (value ? value : values?.title) : ''}
                          onChange={onChange}
                          placeholder='Attendence Title'
                          error={Boolean(errors.title)}
                          {...(errors.title && { helperText: 'This field is required' })}
                        />
                      )
                    }}
                  />

                  <CustomTextField
                    select
                    fullWidth
                    rules={{ required: true }}
                    sx={{ mb: 4 }}
                    label='Personal Trainer'
                    disabled={(updateAttendence && updateAttendence.id) || !booking}
                    SelectProps={{
                      value: values?.trainer,
                      onChange: e => setValues({ ...values, trainer: e.target.value as string })
                    }}
                    error={Boolean(errors.title)}
                    {...(errors.title && { helperText: 'Trainer is required' })}
                  >
                    {trainer &&
                      trainer.map((trainer: any) => (
                        <MenuItem key={trainer.id} value={trainer.id}>
                          {trainer.firstName}
                        </MenuItem>
                      ))}
                  </CustomTextField>

                  {/*Date  */}
                  <Box sx={{ mb: 4 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Stack display={'flex'} flexDirection={'column'} spacing={5}>
                        <DateTimePicker
                          label='Start Date'
                          value={startDate}
                          minDate={dayjs()}
                          disabled={!booking || updateAttendence?.id}
                          onChange={(newStartDate: any) => {
                            setStartDate(newStartDate)
                          }}
                          viewRenderers={{
                            hours: renderTimeViewClock,
                            minutes: renderTimeViewClock,
                            seconds: renderTimeViewClock
                          }}
                        />
                        <CustomTextField
                          select
                          fullWidth
                          label='Time Interval'
                          disabled={!booking || updateAttendence?.id}
                          value={timeInterval}
                          onChange={e => setTimeInterval(e.target.value)}
                        >
                          <MenuItem value='30'>30 min</MenuItem>
                          {/* <MenuItem value='45'>45 min</MenuItem> */}
                          {/* <MenuItem value='60'>60 min</MenuItem> */}
                        </CustomTextField>

                        <DateTimePicker label='End Date' value={endDate} disabled />
                      </Stack>
                    </LocalizationProvider>
                  </Box>

                  <Controller
                    name='userCount'
                    control={control}
                    defaultValue={selectedUserCount}
                    render={({ field }) => (
                      <CustomTextField
                        select
                        fullWidth
                        label='Users'
                        disabled={(updateAttendence && updateAttendence.id) || !booking}
                        sx={{ mb: 4 }}
                        {...field}
                        SelectProps={{
                          value: selectedUserCount,
                          onChange: (event: any) => {
                            const newTotalUsers: any = event.target.value as number
                            const count = event.target.value
                            setSelectedUserCount(count)
                            // values.userCount = count

                            if (newTotalUsers < selectedUserCount) {
                              setSelectedUsers([])
                              setUserSignatures([])
                              setValues({ ...values, signature: [] })
                            }
                            // setSelectedUsers([])
                            // setUserSignatures([])

                            setSelectedUsers(prevSelectedUsers => {
                              const newSelectedUsers = [...prevSelectedUsers]

                              // Remove excess selected users if newTotalUsers is smaller
                              if (newTotalUsers < newSelectedUsers.length) {
                                newSelectedUsers.length = newTotalUsers
                                // Also update the users field in formik values
                                const newUsers = [...values.users]
                                newUsers.length = newTotalUsers
                                setValue('users', newUsers)
                              }

                              return newSelectedUsers
                            })
                            setValue('userCount', newTotalUsers)
                          }
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6].map(value => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />

                  {selectedUserCount && selectedUserCount > 0 ? (
                    <>
                      {[...Array(selectedUserCount)].map((_, index) => (
                        <>
                          <Divider />
                          <Grid container spacing={2} mt={1} mb={1}>
                            <Grid item xs={12} sm={12} md={9} lg={9}>
                              <Controller
                                name={`users[${index}]`}
                                control={control}
                                render={({ field }) => (
                                  <CustomTextField
                                    select
                                    fullWidth
                                    label={`User ${index + 1}`}
                                    sx={{ mb: 4 }}
                                    disabled={(updateAttendence && updateAttendence.id) || !booking}
                                    {...field}
                                    SelectProps={{
                                      value: selectedUsers[index] || '',
                                      onChange: (event: any) => {
                                        const newUserSelections = [selectedUsers]
                                        newUserSelections[index] = event.target.value
                                        setValue('users', newUserSelections)

                                        if (!event.target.value) {
                                          handleUserDelete(index)
                                        }

                                        checkWallet({
                                          userId: newUserSelections[index],
                                          teamSize: selectedUserCount
                                        }).then(res => {
                                          if (res.data.data) {
                                            if (res.data.data.message.includes('has enough balance in the wallet')) {
                                              setMessage(res.data.data.message);
                                              setColor('primary');
                                              setSnackbarOpen(true);
                                            } else {
                                              setMessage(res.data.data.message)
                                              setColor('secondary');
                                              setSnackbarOpen(true);
                                            }
                                          }
                                        })

                                        setSelectedUsers(prevSelectedUsers => {
                                          const newSelectedUsers = [...prevSelectedUsers]

                                          if (event.target.value) {
                                            newSelectedUsers[index] = event.target.value
                                          } else {
                                            delete newSelectedUsers[index]
                                          }
                                          // values.users = newSelectedUsers
                                          return newSelectedUsers
                                        })
                                      }
                                    }}
                                  >
                                    {userOptions.map((user: any) => (
                                      <MenuItem
                                        key={user.id}
                                        value={'' + user.id}
                                        disabled={
                                          selectedUsers.includes(user.id) || selectedUsers.includes('' + user.id)
                                        }
                                      >
                                        {user.firstName}
                                      </MenuItem>
                                    ))}
                                  </CustomTextField>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={2}
                              sm={3}
                              md={3}
                              lg={3}
                              sx={{
                                marginTop: { lg: 4.4, md: 4, sm: 0, xs: 0 },
                                marginBottom: { xs: 2, sm: 2, md: 0 }
                              }}
                            >
                              {booking ? (
                                <>
                                  {updateAttendence && updateAttendence.id ? null : (
                                    <IconButton
                                      aria-label='close'
                                      disabled={!selectedUsers[index]}
                                      onClick={() => {
                                        handleUserDelete(index)
                                      }}
                                      color='error'
                                    >
                                      <Icon icon='tabler:trash' />
                                    </IconButton>
                                  )}
                                </>
                              ) : (
                                <>
                                  {updateAttendence && updateAttendence.id ? null : (
                                    <Button
                                      variant='outlined'
                                      disabled={!selectedUsers[index]}
                                      onClick={() => {
                                        handleSignButtonClick(index)

                                        checkWallet({ userId: selectedUsers[index], teamSize: values.userCount }).then(
                                          res => {
                                            if (res.data.data) {
                                              if (res.data.data.message.includes('has enough balance in the wallet')) {
                                                setMessage(res.data.data.message);
                                                setColor('success');
                                                setSnackbarOpen(true);
                                              } else {
                                                setMessage(res.data.data.message)
                                                setColor('secondary');
                                                setSnackbarOpen(true);
                                              }
                                            }
                                          }
                                        )
                                      }}
                                    >
                                      Sign
                                    </Button>
                                  )}
                                </>
                              )}
                            </Grid>
                            <Grid item xs={10} sm={9} md={12} lg={12} textAlign={'center'}>
                              {userSignatures[index] && (
                                <>
                                  <img
                                    src={userSignatures[index]}
                                    alt={`User ${index + 1} Signature`}
                                    style={{
                                      maxWidth: '180px',
                                      border: '0.5px solid black',
                                      borderRadius: '10px',
                                      padding: '5px'
                                    }}
                                  />
                                </>
                              )}
                            </Grid>
                          </Grid>
                        </>
                      ))}
                    </>
                  ) : null}

                  <Dialog open={showSignatureDialog} onClose={() => setShowSignatureDialog(false)}>
                    <DialogTitle variant='h4'>Sign here</DialogTitle>
                    <Divider />

                    <Box sx={{ border: '1px solid black', borderRadius: 1, margin: 1 }}>
                      <DialogContent>
                        {/* Signature canvas component */}
                        <SignatureCanvas
                          penColor='#3A5690'
                          ref={(ref: any) => (canvasRef = ref)}
                          canvasProps={{
                            width: 400,
                            height: 200
                          }}
                        />
                      </DialogContent>
                    </Box>
                    <Divider />
                    <DialogActions>
                      <Button variant='outlined' color='error' onClick={() => setShowSignatureDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant='contained' onClick={() => handleSignatureSave(canvasRef.toDataURL())}>
                        Save Signature
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 9 }}>
                    <RenderSidebarFooter />
                  </Box>
                </form>
              </DatePickerWrapper>
            </Box>
          </>
        )}
      </Drawer>
    </>
  )
}

export default AddAttendenceSidebar
