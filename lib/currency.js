'use strict';

var request = require('request');

function CurrencyController(options) {
  this.node = options.node;
  var refresh = options.currencyRefresh || CurrencyController.DEFAULT_CURRENCY_DELAY;
  this.currencyDelay = refresh * 60000;
  this.bitstampRate = 0;
  this.timestamp = Date.now();
}

CurrencyController.DEFAULT_CURRENCY_DELAY = 10;

CurrencyController.prototype.index = function(req, res) {
  var self = this;
  var currentTime = Date.now();
  if (self.bitstampRate === 0 || currentTime >= (self.timestamp + self.currencyDelay)) {
    self.timestamp = currentTime;
    request('https://www.bitstamp.net/api/ticker/', function(err, response, body) {
      if (err) {
        self.node.log.error(err);
      }
      if (!err && response.statusCode === 200) {
        self.bitstampRate = parseFloat(JSON.parse(body).last);
      }
      res.jsonp({
        status: 200,
        data: { 
          bitstamp: self.bitstampRate 
        }
      });
    });
  } else {
    res.jsonp({
      status: 200,
      data: { 
        bitstamp: self.bitstampRate 
      }
    });
  }

};

CurrencyController.prototype.getCoinSupply = function(callback) {
  this.node.services.bitcoind.getStakingInfo(function(err, info) {
    if (err) {
      return callback(err);
    }
    callback(null, {
      console.log(info);
      supply: info.supply
    });
  });
};

CurrencyController.prototype.supply = function(req, res) {
  this.getCoinSupply(function(err, result) {
      if (err) {
        return self.common.handleErrors(err, res);
      }
      res.jsonp(result);
  });
}

module.exports = CurrencyController;
