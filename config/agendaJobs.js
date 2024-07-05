const Agenda = require('agenda');

let mongoConnectionString;

if (process.env.NODE_ENV === 'development') {
  mongoConnectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@test/${process.env.DB_NAME}?retryWrites=true&w=majority`;
}
else if (process.env.NODE_ENV === 'production') {
  mongoConnectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@test/${process.env.DB_NAME}?retryWrites=true&w=majority`;
}

const agendaInstance = new Agenda({
  db: { address: mongoConnectionString, collection: 'posAgendaJobs' },
});

module.exports = { agendaInstance, mongoConnectionString };
