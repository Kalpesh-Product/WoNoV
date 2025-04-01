const humanTime = (date) => {
    return new Intl.DateTimeFormat("en-GB", {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };
  
  export default humanTime;
  