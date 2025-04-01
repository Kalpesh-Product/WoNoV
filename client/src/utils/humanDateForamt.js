const humanDate = (date) =>{
    return new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:'numeric',year:'numeric'}).format(new Date(date))
}

export default humanDate