// ** React Imports
import { useState, useEffect, forwardRef, useCallback, Fragment, SetStateAction } from 'react'

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

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { AddEventSidebarType, EventDateType } from 'src/types/apps/calendarTypes'
import { getAllUser } from 'src/services/user.service'
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid } from '@mui/material'

const userOptions = ['test1']

interface PickerProps {
  label?: string
  error?: boolean
  registername?: string
}

const defaultState = {
  title: '',
  userCount: '',
  trainer: '',
  users: Array().fill(''),
  startDate: new Date(),
  endDate: new Date(),
  allDay: true,
  description: '',
  signature: Array().fill('')
}

type FormData = typeof defaultState

const AddEventSidebar = (props: AddEventSidebarType) => {
  const [selectedUserCount, setSelectedUserCount] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  const [values, setValues] = useState<any>(defaultState)
  const [trainer, setTrainer] = useState<FormData[]>([])

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

  const getUserData = () => {
    return getAllUser().then(res => {
      if (res.status == 200) {
        const trainerUsers = res.data.data.filter((user: any) => user.type === 'trainer')
        setTrainer(trainerUsers)
      }
    })
  }

  useEffect(() => {
    getUserData()
  }, [])

  const handleSidebarClose = async () => {
    setValues(defaultState)
    clearErrors()
    reset(defaultState)
    dispatch(handleSelectEvent(null))
    handleAddEventSidebarToggle()
    setSelectedUserCount(1)
  }

  // ================================
  const [userSignatures, setUserSignatures] = useState<Array<string>>(new Array(values.userCount).fill(''))
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [currentUserForSignature, setCurrentUserForSignature] = useState<any>(null)

  let canvasRef: { isEmpty: () => any; toDataURL: () => SetStateAction<any> }

  const handleSignButtonClick = (userIndex: any) => {
    setCurrentUserForSignature(userIndex)
    setShowSignatureDialog(true)
  }

  const handleSignatureSave = (signatureData: string) => {
    const updatedSignatures = [...values.signature]
    if (currentUserForSignature !== null) {
      updatedSignatures[currentUserForSignature] = signatureData
      setUserSignatures(updatedSignatures)
    }
    setShowSignatureDialog(false)

    // Update the signature array in formik.values
    const updatedSignatureArray: any = [...values.signature]
    updatedSignatureArray[currentUserForSignature] = signatureData
    setValue('signature', updatedSignatures)
    values.signature = updatedSignatures
  }

  const onSubmit = (data: { title: string; userCount: string; trainer: any; users: any }) => {
    const modifiedEvent = {
      title: data.title,
      end: values.endDate,
      start: values.startDate,
      trainer: values.trainer,
      userCount: '' + values.userCount,
      users: values.users,
      signature: values.signature
      // users: { id: values.users, sign: values.signature }
    }
    // if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.title.length)) {
    //   dispatch(addEvent(modifiedEvent))
    // } else {
    //   dispatch(updateEvent({ id: store.selectedEvent.id, ...modifiedEvent }))
    // }
    calendarApi.refetchEvents()
    handleSidebarClose()
  }

  const handleDeleteEvent = () => {
    if (store.selectedEvent) {
      dispatch(deleteEvent(store.selectedEvent.id))
    }

    // calendarApi.getEventById(store.selectedEvent.id).remove()
    handleSidebarClose()
  }

  const handleStartDate = (date: Date) => {
    if (date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    }
  }

  const resetToStoredValues = useCallback(() => {
    if (store.selectedEvent !== null) {
      const event: any = store.selectedEvent
      setValue('title', event.title || '')
      setValues({
        title: event.title || '',
        users: event.users || [],
        signature: event.signature || [],
        userCount: event.userCount || '',
        description: event.description || '',
        trainer: event.extendedProps.trainer.firstName || '',
        endDate: event.end !== null ? event.end : event.start,
        startDate: event.start !== null ? event.start : new Date()
      })
    }
  }, [setValue, store.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultState)
    setSelectedUserCount(0)
    setUserSignatures([])
  }, [setValue])

  useEffect(() => {
    if (store.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
      setSelectedUsers([])
      setSelectedUserCount(0)
      setUserSignatures([])
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, store.selectedEvent])

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
    if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.title.length)) {
      return (
        <Fragment>
          <Button type='submit' variant='contained' sx={{ mr: 4 }}>
            Add
          </Button>
          <Button variant='tonal' color='secondary' onClick={resetToEmptyValues}>
            Reset
          </Button>
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          <Button type='submit' variant='contained' sx={{ mr: 4 }}>
            Update
          </Button>
          <Button variant='tonal' color='secondary' onClick={resetToStoredValues}>
            Reset
          </Button>
        </Fragment>
      )
    }
  }

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] } }}
    >
      <Box
        className='sidebar-header'
        sx={{
          p: 6,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant='h5'>
          {store.selectedEvent !== null && store.selectedEvent.title.length ? 'Update Attendence' : 'Add Attendence'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {store.selectedEvent !== null && store.selectedEvent.title.length ? (
            <IconButton
              size='small'
              onClick={handleDeleteEvent}
              sx={{ color: 'text.primary', mr: store.selectedEvent !== null ? 1 : 0 }}
            >
              <Icon icon='tabler:trash' fontSize='1.25rem' />
            </IconButton>
          ) : null}
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
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  label='Title'
                  value={value}
                  sx={{ mb: 4 }}
                  onChange={onChange}
                  placeholder='Attendence Title'
                  error={Boolean(errors.title)}
                  {...(errors.title && { helperText: 'This field is required' })}
                />
              )}
            />

            <CustomTextField
              select
              fullWidth
              sx={{ mb: 4 }}
              label='Personal Trainer'
              SelectProps={{
                value: values.trainer,
                onChange: e => setValues({ ...values, trainer: e.target.value as string })
              }}
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
              <DatePicker
                selectsStart
                id='event-start-date'
                endDate={values.endDate as EventDateType}
                selected={values.startDate as EventDateType}
                startDate={values.startDate as EventDateType}
                showTimeSelect={!values.allDay}
                dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent label='Start Date' registername='startDate' />}
                onChange={(date: Date) => setValues({ ...values, startDate: new Date(date) })}
                onSelect={handleStartDate}
              />
            </Box>
            <Box sx={{ mb: 4 }}>
              <DatePicker
                selectsEnd
                id='event-end-date'
                endDate={values.endDate as EventDateType}
                selected={values.endDate as EventDateType}
                minDate={values.startDate as EventDateType}
                startDate={values.startDate as EventDateType}
                showTimeSelect={!values.allDay}
                dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent label='End Date' registername='endDate' />}
                onChange={(date: Date) => setValues({ ...values, endDate: new Date(date) })}
              />
            </Box>
            {/*Date  */}

            {/* <Controller
              name='userCount'
              control={control}
              defaultValue=''
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Users'
                  sx={{ mb: 4 }}
                  {...field}
                  SelectProps={{
                    value: selectedUserCount,
                    onChange: (event: any) => {
                      const count = event.target.value
                      setSelectedUserCount(count)
                      // Clear selections when the number of users changes
                      setSelectedUsers([])
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
            /> */}

            <Controller
              name='userCount'
              control={control}
              defaultValue=''
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Users'
                  sx={{ mb: 4 }}
                  {...field}
                  SelectProps={{
                    value: values.userCount,
                    onChange: (event: React.ChangeEvent<{ value: any }>) => {
                      const newTotalUsers: any = event.target.value as number
                      const count = event.target.value
                      setSelectedUserCount(count)
                      // Clear selections when the number of users changes
                      // setSelectedUsers([])

                      values.userCount = count

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
            {}
            {values.userCount && values.userCount > 0 ? (
              <>
                {[...Array(selectedUserCount)].map((_, index) => (
                  <>
                    <Divider />
                    <Grid container spacing={2} mt={1} mb={1}>
                      <Grid item xs={12} sm={12} md={9} lg={9}>
                        <Controller
                          name={`users[${index + 1}]`}
                          // rules={{ required: true }}
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              select
                              fullWidth
                              label={`User ${index + 1}`}
                              sx={{ mb: 4 }}
                              // error={Boolean(errors.users?.[index])}
                              // {...(errors.users?.[index] && { helperText: 'Select the user' })}
                              {...field}
                              SelectProps={{
                                value: selectedUsers[index] || '',
                                onChange: (event: any) => {
                                  const newUserSelections = [...values.users]
                                  newUserSelections[index] = event.target.value
                                  setValue('users', newUserSelections)

                                  setSelectedUsers(prevSelectedUsers => {
                                    const newSelectedUsers = [...prevSelectedUsers]
                                    if (event.target.value) {
                                      newSelectedUsers[index] = event.target.value
                                    } else {
                                      delete newSelectedUsers[index]
                                    }
                                    values.users = newSelectedUsers
                                    return newSelectedUsers
                                  })
                                }
                              }}
                            >
                              {userOptions.map(user => (
                                <MenuItem key={user} value={user} disabled={selectedUsers.includes(user)}>
                                  {user}
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
                        sx={{ marginTop: { lg: 4, md: 4, sm: 0, xs: 0 }, marginBottom: { xs: 2, sm: 2, md: 0 } }}
                      >
                        <Button
                          variant='outlined'
                          disabled={!values.users}
                          onClick={() => handleSignButtonClick(index)}
                        >
                          Sign
                        </Button>
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

              <DialogContent>
                {/* Signature canvas component */}
                <Box sx={{ border: '1px solid black', borderRadius: 1 }}>
                  <SignatureCanvas
                    penColor='#3A5690'
                    ref={(ref: any) => (canvasRef = ref)}
                    canvasProps={{
                      width: 400,
                      height: 200
                    }}
                  />
                </Box>
              </DialogContent>
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
    </Drawer>
  )
}

export default AddEventSidebar
