// ** React Import
import { useEffect, useRef, useState } from 'react'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import interactionPlugin from '@fullcalendar/interaction'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'

// ** Types
import { CalendarType } from 'src/types/apps/calendarTypes'

// ** Third Party Style Import
import 'bootstrap-icons/font/bootstrap-icons.css'
import { getAllAttendance } from 'src/services/attendance.service'
import moment from 'moment'
import { getAllBookings } from 'src/services/booking.service'

const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    location: '',
    description: ''
  }
}

const Calendar = (props: CalendarType) => {
  const [attendence, setAttendence] = useState<any>([]);
  const [booking, setBooking] = useState<any>([]);

  useEffect(() => {
    getAllAttendance().then((res: any) => {
      if (res.status === 200) {
        setAttendence(res.data.data)
      }
    })
  }, []);

  useEffect(() => {
    getAllBookings().then((res: any) => {
      if (res.status === 200) {
        setBooking(res.data.data)
      }
    })
  }, []);

  // ** Props
  const {
    store,
    dispatch,
    direction,
    updateEvent,
    calendarApi,
    calendarsColor,
    setCalendarApi,
    handleSelectEvent,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle
  } = props

  // ** Refs
  const calendarRef = useRef()

  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
  }, [calendarApi, setCalendarApi])

  if (store) {
    const concatenatedArray = [...attendence, ...booking];
    // ** calendarOptions(Props)
    const calendarOptions = {
      events: concatenatedArray.length ? concatenatedArray : [],
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin, momentTimezonePlugin],
      initialView: 'timeGridWeek',
      headerToolbar: {
        start: 'sidebarToggle, prev, next, title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      views: {
        week: {
          titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      },
      editable: true,
      eventResizableFromStart: true,
      dragScroll: true,
      dayMaxEvents: 2,
      navLinks: true,
      timeZone: 'Asia/Kolkata',
      timeZoneParam: 'Asia/Kolkata',

      eventClassNames({ event: calendarEvent }: any) {
        // @ts-ignore
        const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar]
        return [
          // Background Color
          `bg-${colorName}`
        ]
      },

      eventClick({ event: clickedEvent }: any) {
        dispatch(handleSelectEvent(clickedEvent))
        handleAddEventSidebarToggle()

        // * Only grab required field otherwise it goes in infinity loop
        // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
        // event.value = grabEventDataFromEventApi(clickedEvent)

        // isAddNewEventSidebarActive.value = true
      },

      customButtons: {
        sidebarToggle: {
          icon: 'bi bi-list',
          click() {
            handleLeftSidebarToggle()
          }
        }
      },

      dateClick(info: any) {
        const ev = { ...blankEvent }
        ev.start = info.date
        ev.end = info.date
        ev.allDay = true

        // @ts-ignore
        dispatch(handleSelectEvent(ev))
        handleAddEventSidebarToggle()
      },

      /*
        Handle event drop (Also include dragged event)
        ? Docs: https://fullcalendar.io/docs/eventDrop
        ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
      */
      eventDrop({ event: droppedEvent }: any) {
        dispatch(updateEvent(droppedEvent))
      },

      /*
        Handle event resize
        ? Docs: https://fullcalendar.io/docs/eventResize
      */
      eventResize({ event: resizedEvent }: any) {
        dispatch(updateEvent(resizedEvent))
      },

      ref: calendarRef,

      // Get direction from app state (store)
      direction
    }

    // @ts-ignore
    return <FullCalendar {...calendarOptions} />
  } else {
    return null
  }
}

export default Calendar
