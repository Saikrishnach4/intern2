const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();


mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));


const tickerSchema = new mongoose.Schema({
  symbol: String,
  last: Number,
  volume: Number
});

const Ticker = mongoose.model('Ticker', tickerSchema);

app.use(cors());


app.get('/data', async (req, res) => {
  try {
 
    const tickerData = await Ticker.find();
    if (tickerData.length > 0) {
     
      res.json(tickerData);
    } else {
     
      const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
      const tickers = response.data;
      const tickerData = Object.keys(tickers).map(key => {
        const ticker = tickers[key];
        return {
          symbol: key,
          last: ticker.last,
          volume: ticker.volume
        };
      });
      await Ticker.insertMany(tickerData);
      res.json(tickerData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
