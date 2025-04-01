const initialChats = (name) => {
    const initialMessages = [
      {
        id: 1,
        sender: name,
        time: "Today 9:45 am",
        content: "Good Afternoon 👋\nI hope all is well...",
        fromMe: false,
      },
      {
        id: 2,
        sender: "Me",
        time: "Today 9:46 am",
        content: "Sounds great!",
        fromMe: true,
      },
      {
        id: 3,
        sender: name,
        time: "Today 9:45 am",
        content: "Good Afternoon Lori! \nI hope all is well...",
        fromMe: false,
      },
    ];
    return initialMessages;
  };
  
  export default initialChats;
  