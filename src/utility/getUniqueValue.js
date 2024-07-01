const getUniqueValue = (objArr, key, priorityIds) => {
    // in an array of objects, return unique rows based on "key" value
    // if priorityIds is provided, whenever there are duplicate values, take the row that matches the priorityId

    return Object.values(objArr.reduce((arr, obj) => {
        if (!arr[obj[key]] || priorityIds.includes(obj.id)) {
            arr[obj[key]] = obj
        }
        return arr
    }, {}))
}

export default getUniqueValue