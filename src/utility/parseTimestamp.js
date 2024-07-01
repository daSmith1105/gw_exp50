const parseTimestamp = (timestamp) => {
    // parse timestamp into date and time values in this format: Jan-01 01:01 AM

    const ts = new Date(timestamp)
    const locale = ts.toLocaleString('default', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    const date = locale.substring(0,6).replace(' ', '-')
    const time = locale.substring(10)
    return {date, time}
}

export default parseTimestamp;