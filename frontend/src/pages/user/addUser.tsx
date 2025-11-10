// ** React Imports
import { ChangeEvent, forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
// import parseISO
import { parseISO } from 'date-fns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Alert, FormControl, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, Snackbar } from '@mui/material'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import { addUsers, getOne, updateUser } from 'src/services/user.service'
import { redirect, useNavigate, useParams } from 'react-router-dom'
import { useRouter } from 'next/router'
import moment from 'moment'
import Loader from '../extra/Loader'

const countries = [
  { value: 'Brazil', label: 'Brazil' },
  { value: 'US', label: 'United States' },
  { value: 'Portugal', label: 'Portugal' }
]
const countryStateCities: Record<string, { states: any[]; cities: Record<string, string[]> }> = {
  Portugal: {
    states: [
      'Lisbon',
      'Porto',
      'Faro',
      'Aveiro',
      'Beja',
      'Braga',
      'Bragança',
      'CasteloBranco',
      'Coimbra',
      'Évora',
      'Guarda',
      'Leiria',
      'Portalegre',
      'Santarém',
      'Setúbal',
      'VianaDoCastelo',
      'VilaReal',
      'Viseu'
    ],
    // Add more states as needed
    cities: {
      Lisbon: ['Lisbon City', 'Sintra', 'Cascais'],
      Porto: ['Porto City', 'Vila Nova de Gaia', 'Matosinhos'],
      Faro: ['Faro City', 'Albufeira', 'Lagos'],
      Aveiro: ['Aveiro', 'Espinho', 'Ílhavo', 'Ovar', 'Santa Maria da Feira'],
      Beja: ['Beja', 'Moura', 'Serpa', 'Odemira', 'Aljustrel'],
      Braga: ['Braga', 'Guimarães', 'Bragança', 'Viana do Castelo', 'Barcelos'],
      Bragança: ['Bragança', 'Miranda do Douro', 'Vimioso', 'Mogadouro', 'Mirandela'],
      CasteloBranco: ['Castelo Branco', 'Covilhã', 'Fundão', 'Idanha-a-Nova', 'Penamacor'],
      Coimbra: ['Coimbra', 'Figueira da Foz', 'Lousã', 'Cantanhede', 'Montemor-o-Velho'],
      Évora: ['Évora', 'Reguengos de Monsaraz', 'Vila Viçosa', 'Estremoz', 'Mora'],
      Guarda: ['Guarda', 'Seia', 'Gouveia', 'Celorico da Beira', 'Fornos de Algodres'],
      Leiria: ['Leiria', 'Caldas da Rainha', 'Marinha Grande', 'Peniche', 'Pombal'],
      Portalegre: ['Portalegre', 'Elvas', 'Ponte de Sor', 'Campo Maior', 'Nisa'],
      Santarém: ['Santarém', 'Tomar', 'Santarém', 'Entroncamento', 'Torres Novas'],
      Setúbal: ['Setúbal', 'Almada', 'Barreiro', 'Sesimbra', 'Moita'],
      VianaDoCastelo: ['Viana do Castelo', 'Ponte de Lima', 'Caminha', 'Vila Nova de Cerveira', 'Melgaço'],
      VilaReal: ['Vila Real', 'Chaves', 'Régua', 'Montalegre', 'Murça'],
      Viseu: ['Viseu', 'Lamego', 'Tondela', 'Vila Nova de Paiva', 'Mangualde']
    }
  }
  // Define states and cities for other countries here
}

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  taxNumber: '',
  birthDate: null,
  gender: 'male',
  address1: '',
  password: '',
  city: '',
  state: '',
  type: '',
  country: ''
}

const showErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `${field} field is required`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`
  } else {
    return ''
  }
}

interface CustomInputProps {
  value: DateType
  label: string
  error: boolean
  onChange: (event: ChangeEvent) => void
}
const CustomInput = forwardRef(({ ...props }: CustomInputProps, ref) => {
  return <CustomTextField fullWidth inputRef={ref} {...props} sx={{ width: '100%' }} />
})

const schema = yup.object().shape({
  firstName: yup
    .string()
    .trim('The contact name cannot include leading and trailing spaces')
    .required('First name is required'),
  lastName: yup
    .string()
    .trim('The contact name cannot include leading and trailing spaces')
    .required('First name is required'),
  email: yup
    .string()
    .trim('The contact name cannot include leading and trailing spaces')
    .required('Email address is required'),
  type: yup
    .string()
    .trim('The contact name cannot include leading and trailing spaces')
    .required('User type is required'),
  mobile: yup
    .string()
    .trim('The contact name cannot include leading and trailing spaces')
    .required('Mobile number is required'),
  taxNumber: yup
    .string()
    .trim('The contact name cannot include leading and trailing spaces')
    .required('Tax number is required')
})

const addUser = () => {
  const router = useRouter()
  const { userId } = router.query
  const isEditing = !!userId

  // ** Hook
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const selectedCountry = watch('country')
  const selectedStates = watch('state')

  const updateStates = (selectedCountry: any) => {
    return countryStateCities[selectedCountry]?.states || []
  }

  const updateCities = (selectedState: any) => {
    return countryStateCities[selectedCountry]?.cities[selectedState] || []
  }

  const handleCancelClick = () => {
    router.push('/user/userTable')
  }

  // Use useEffect to update state and city options when selectedCountry changes
  useEffect(() => {
    if (!isEditing) {
      setValue('state', '') // Reset the state field when the country changes
      setValue('city', '') // Reset the city field when the state changes
    }
  }, [selectedCountry])

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [color, setColor] = useState<any>('')

  const closeSnackbar = () => {
    setSnackbarOpen(false)
  }
  const [birthdates, setBirthdates] = useState<any>(null)
  const [userData, setUserData] = useState<any>([])
  const [loader, setLoader] = useState<any>(true)
  const [disable, setDisable] = useState<any>(false)

  useEffect(() => {
    if (isEditing) {
      setLoader(true)
      getOne({ userId }).then(res => {
        if (res.status === 200) {
          setLoader(false)
          setUserData(res.data.data)

          // Set form values with user data
          Object.keys(defaultValues).forEach((key: any) => {
            setValue(key, res.data.data[key])
          })
        }
      })
    }
  }, [isEditing, userId, setValue])

  const onSubmit = (data: any) => {
    setDisable(true)
    const apiFunction = isEditing ? updateUser : addUsers
    data.birthDate = data.birthDate ? moment(data.birthDate).format('YYYY-MM-DD HH:mm:ss') : null
    const reqData =
      Object.keys(userData).length !== 0
        ? { userId: userId, data }
        : {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            mobile: data.mobile,
            taxNumber: data.taxNumber,
            birthDate: data.birthDate ? moment(data.birthDate).format('YYYY-MM-DD HH:mm:ss') : null,
            gender: data.gender,
            address1: data.address1,
            password: data.password,
            city: data.city,
            state: data.state,
            type: data.type,
            country: data.country
          }
    apiFunction(reqData).then((res: any) => {
      if (res.status === 200) {
        setDisable(false)
        if (isEditing) {
          setMessage('User updated successfully')
          setColor('success')
          setSnackbarOpen(true)
          router.push('/user/userTable')
        } else {
          setMessage('User added successfully')
          setColor('success')
          setSnackbarOpen(true)
          reset(defaultValues)
          router.push('/user/userTable')
        }
      }
    }).catch((error) => {
      setDisable(false)
      setColor('error')
      setMessage(error.response.data.message)
      setSnackbarOpen(true)
    })
  }

  return (
    <>
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

      <Card>
        <CardHeader title={isEditing ? 'Update User' : 'Add User'} />
        { isEditing && loader ?
         <CardContent>
           <Loader/>
         </CardContent> : 
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={6}>
                <Controller
                  name='firstName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='First Name'
                      onChange={onChange}
                      error={Boolean(errors.firstName)}
                      aria-describedby='validation-schema-first-name'
                      {...(errors.firstName && { helperText: errors.firstName.message })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Controller
                  name='lastName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Last Name'
                      onChange={onChange}
                      error={Boolean(errors.lastName)}
                      aria-describedby='validation-schema-last-name'
                      {...(errors.lastName && { helperText: errors.lastName.message })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      type='email'
                      value={value}
                      disabled={isEditing}
                      label='Email address'
                      onChange={onChange}
                      error={Boolean(errors.email)}
                      aria-describedby='validation-schema-email'
                      {...(errors.email && { helperText: errors.email.message })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Controller
                  name='mobile'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      type='mobile'
                      value={value}
                      label='Mobile number'
                      onChange={onChange}
                      error={Boolean(errors.mobile)}
                      aria-describedby='validation-schema-moble'
                      {...(errors.mobile && { helperText: errors.mobile.message })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Controller
                  name='type'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label='Type'
                      id='user-type'
                      defaultValue=''
                      {...field}
                      error={Boolean(errors.type)}
                      helperText={errors.type?.message || ''}
                    >
                      <MenuItem disabled value=''>
                        <em>Select user type</em>
                      </MenuItem>
                      <MenuItem value='admin'>Admin</MenuItem>
                      <MenuItem value='trainer'>Trainer</MenuItem>
                      <MenuItem value='student'>Student</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Controller
                  name='taxNumber'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      type='text'
                      value={value}
                      label='Tax Number'
                      onChange={onChange}
                      error={Boolean(errors.taxNumber)}
                      // placeholder='carterleonard@gmail.com'
                      aria-describedby='validation-schema-moble'
                      {...(errors.taxNumber && { helperText: errors.taxNumber.message })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl>
                  <FormLabel sx={{ fontSize: '12px' }}>D.O.B</FormLabel>
                  <Controller
                    name='birthDate'
                    control={control}
                    rules={{ required: false }}
                    render={({ field: { value, onChange } }) => (
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          value={value ? parseISO(value) : null}
                          onChange={date => onChange(date)}
                          content={false}
                          placeholderText='MM/DD/YYYY'
                          customInput={
                            <CustomInput
                              value={value}
                              onChange={onChange}
                              label='Date of Birth'
                              error={Boolean(errors.birthDate)}
                              aria-describedby='validation-basic-birthDate'
                              {...(errors.birthDate && { helperText: 'This field is required' })}
                            />
                          }
                        />
                      </LocalizationProvider>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl error={Boolean(errors.gender)}>
                  <FormLabel>Gender</FormLabel>
                  <Controller
                    name='gender'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <RadioGroup row {...field} aria-label='gender' name='validation-basic-radio'>
                        <FormControlLabel
                          value='female'
                          label='Female'
                          sx={errors.gender ? { color: 'error.main' } : null}
                          control={<Radio sx={errors.gender ? { color: 'error.main' } : null} />}
                        />
                        <FormControlLabel
                          value='male'
                          label='Male'
                          sx={errors.gender ? { color: 'error.main' } : null}
                          control={<Radio sx={errors.gender ? { color: 'error.main' } : null} />}
                        />
                        <FormControlLabel
                          value='other'
                          label='Other'
                          sx={errors.gender ? { color: 'error.main' } : null}
                          control={<Radio sx={errors.gender ? { color: 'error.main' } : null} />}
                        />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={12}>
                <Controller
                  name='address1'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      rows={4}
                      fullWidth
                      multiline
                      value={value}
                      type='address1'
                      onChange={onChange}
                      label='Address'
                      error={Boolean(errors.address1)}
                      aria-describedby='validation-basic-address1'
                      {...(errors.address1 && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={4}>
                <Controller
                  name='country'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <CustomTextField select fullWidth label='Country' id='form-layouts-separator-select' {...field}>
                      <MenuItem disabled value=''>
                        <em>Select country</em>
                      </MenuItem>
                      {countries.map(country => (
                        <MenuItem key={country.value} value={country.value}>
                          {country.label}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={4}>
                <Controller
                  name='state'
                  control={control}
                  defaultValue={userData.state || ''}
                  render={({ field }) => (
                    <CustomTextField select fullWidth label='State' id='form-layouts-separator-select' {...field}>
                      <MenuItem disabled value=''>
                        <em>Select state</em>
                      </MenuItem>
                      {updateStates(selectedCountry).map(state => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={4}>
                <Controller
                  name='city'
                  control={control}
                  defaultValue={userData.city || ''}
                  render={({ field }) => (
                    <CustomTextField select fullWidth label='City' id='form-layouts-separator-select' {...field}>
                      <MenuItem disabled value=''>
                        <em>Select city</em>
                      </MenuItem>
                      {updateCities(selectedStates).map(city => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} display={'flex'} flexDirection={'row-reverse'} mt={1} mr={1}>
                <Button type='submit' variant='contained' disabled={disable}>
                  {isEditing ? 'Update User' : 'Add User'}
                </Button>
                <Button variant='outlined' onClick={handleCancelClick} sx={{ mr: 1 }}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent> }
      </Card>
    </>
  )
}

export default addUser
