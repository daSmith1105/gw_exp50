export default insertSorted = (arr, obj, property, order = 'asc') => {
  // this is to insert an obj within an already sorted array based on obj property value
  let sortedArr = [...arr]

  // determine index where to insert the new obj
  let index = sortedArr.findIndex( a => {
    if (order === 'desc') {
      return a[property].localeCompare(obj[property]) < 0
    } else {
      return a[property].localeCompare(obj[property]) > 0
    }
  })

  // if obj should be inserted in the end
  if (index === -1) {
    index = sortedArr.length
  }

  // do the actual insert and return the new array
  sortedArr.splice(index, 0, obj)
  return sortedArr
}