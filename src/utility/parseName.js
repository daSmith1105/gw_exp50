const parseName = (fullname) => {
    // this will parse the name so that if there's only 1 word, it will be considered firstname with no lastname
    // if there are more than 1, then the last word is the last name and the rest will be firstname

    let first = ''
    let last = ''
    const words = fullname.match(/\w+/g)
    if (fullname.length === 1) {
        first = words[0]
    } else if (fullname.length > 1) {
        last = words.pop()
        first = words.join(' ')
    }
    return {first, last}
}

export default parseName;