import { useEffect, useRef, useState } from 'react'

// material-ui
import { Box, CircularProgress, Grid, Stack } from '@mui/material'

// project-imp

// ==============================|| COMPONENTS - PROGRESS ||============================== //

const Loader = () => {
  const [bufferProgress, setBufferProgress] = useState(0)

  const progressRef = useRef(() => {})
  useEffect(() => {
    progressRef.current = () => {
      if (bufferProgress > 100) {
        setBufferProgress(0)
      } else {
        const diff = Math.random() * 10
        // const diff2 = Math.random() * 10;
        setBufferProgress(bufferProgress + diff)
      }
    }
  })

  useEffect(() => {
    const bufferTimer = setInterval(() => {
      progressRef.current()
    }, 500)

    return () => {
      clearInterval(bufferTimer)
    }
  }, [])

  return (
    <Stack spacing={3}>
      <Grid container spacing={3} justifyContent='center' alignItems='center'>
        <Grid item>
          <CircularProgress color='primary' />
        </Grid>
      </Grid>
    </Stack>
  )
}

export default Loader
