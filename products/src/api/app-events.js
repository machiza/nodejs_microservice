module.exports = (app) => {

  app.post('/app-events', async (req, res, next) => {

    const { payload } = req.body;

    console.log('============== Products Service Received Event ====== ', payload.event);
    return res.status(200).json(payload);
    
  })
}