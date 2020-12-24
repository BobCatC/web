const Sails = require('sails'),
  sinon = require('sinon'),
  assert = require('assert'),
  fetchMock = require('fetch-mock'),
  supertest = require('supertest');

var sails

before(function (done) {

  this.timeout(10000);
  process.env.NODE_ENV = 'test';

  Sails.lift({
  }, (err, server) => {
    if (err) {
      return done(err);
    }

    sails = server
    done(err, sails);
  });
});

after(function (done) {
  sails.lower(done)
});


// MARK: - Helpers

describe('#helpers.cityExists', () => {
  before(() => {
    const apiKey = sails.config.weatherApi.key
    const baseUrl = sails.config.weatherApi.baseUrl
    const fetch = fetchMock.sandbox()
    fetch.get(`${baseUrl}?q=City1&appid=${apiKey}`, 200)
    fetch.get(`${baseUrl}?q=City2&appid=${apiKey}`, 404)
    sails.config.globals.fetch = fetch
  })

  after(() => {
    sails.config.globals.fetch = undefined
  })

  it('should return true if weather server responds 200', (done) => {
    sails.helpers.cityExists('City1')
      .then((exists) => {
        assert(exists)
        done()
      })
      .catch(done)
  })

  it('should return false if weather server responds 404', (done) => {
    sails.helpers.cityExists('City2')
      .then((exists) => {
        assert(!exists)
        done()
      })
      .catch(done)
  })
})

describe('#helpers.formatCityName', () => {
  it('should lowercase city name', async () => {
    const name = 'CiTY-name1'
    const formatted = await sails.helpers.formatCityName(name)
    assert.strictEqual('city-name1', formatted)
  })
})

describe('#helpers.getUserByToken', () => {
  before((done) => {
    User.create({
      cookies: 123
    })
      .then(done, done)
  })

  after((done) => {
    User.destroy({})
      .then(done, done)
  })

  it('should return user by existing token', (done) => {
    sails.helpers.getUserByToken('token-1')
      .then((user) => {
        assert.strictEqual(user.cookies, 'token-1')
        done()
      })
      .catch(done)
  })

  it('should create new user for new token', (done) => {
    sails.helpers.getUserByToken('token-2')
      .then((user) => {
        assert.strictEqual(user.cookies, 'token-2')
        done()
      })
      .catch(done)
  })

  it('should create new user for undefined token', (done) => {
    sails.helpers.getUserByToken(undefined)
      .then((user) => {
        assert(user.cookies != null)
        done()
      })
      .catch(done)
  })
})

// MARK: - Favorites controllers

describe('#controllers.favorites.add', () => {
  before(async () => {
    sinon.stub(sails.helpers, 'cityExists').callsFake((cityName) => {
      return cityName !== 'nocity';
    });

    sinon.stub(sails.helpers, 'getSessionUser').callsFake((req, res) => {
      return {
        id: 1,
        cookies: '123'
      };
    });

    sinon.stub(FavoriteCity, 'findOne').callsFake((req) => {
      if (req.user === 1 && req.cityName === 'existing-city') {
        return { cityName: req.cityName, user: req.user }
      }
    })
  })

  after(() => {
    sails.helpers.cityExists.restore()
    sails.helpers.getSessionUser.restore()
    FavoriteCity.findOne.restore()
  })

  it('should create favorite city if new', (done) => {
    supertest(sails.hooks.http.app)
      .post('/favorites')
      .send({ cityName: 'newcity' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  })

  it('should create favorite city if already existing', (done) => {
    supertest(sails.hooks.http.app)
      .post('/favorites')
      .send({ cityName: 'existing-city' })
      .expect(409)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  })

  it('should return 404 if city name is wrong', (done) => {
    supertest(sails.hooks.http.app)
      .post('/favorites')
      .send({ cityName: 'nocity' })
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  })
})

describe('#controllers.favorites.all', () => {
  before(async () => {
    sinon.stub(sails.helpers, 'getSessionUser').callsFake((req, res) => {
      return {
        id: 1,
        cookies: '123'
      };
    });

    sinon.stub(FavoriteCity, 'find').callsFake((req) => {
      if (req.user === 1) {
        return [
          { cityName: 'city-1' },
          { cityName: 'city-2' }
        ]
      }
      else {
        return undefined
      }
    })
  })

  after(() => {
    sails.helpers.getSessionUser.restore()
    FavoriteCity.find.restore()
  })

  it('should return all favorite cities', (done) => {
    supertest(sails.hooks.http.app)
      .get('/favorites')
      .send({ cityName: 'newcity' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.length, 2)
        done();
      });
  })
})

describe('#controllers.favorites.delete', () => {
  var spy

  before(async () => {
    sinon.stub(sails.helpers, 'getSessionUser').callsFake((req, res) => {
      return {
        id: 1,
        cookies: '123'
      };
    });

    spy = sinon.spy(FavoriteCity, 'destroy')
  })

  after(() => {
    sails.helpers.getSessionUser.restore()
  })

  it('should delete favorite city', (done) => {
    supertest(sails.hooks.http.app)
      .delete('/favorites')
      .send({ cityName: 'newcity' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert(spy.withArgs({user: 1, cityName: 'newcity'}).calledOnce)
        done();
      });
  })
})

// MARK: - Weather controllers

describe('#controllers.weather.city', () => {
  const data = {
    name: "city-1",
    main: {
      temp: 290,
      presure: 10,
      humidity: 1
    },
    wind: {
      speed: 5,
      deg: 27
    },
    clouds: {
      all: ''
    },
    coord: {
      lat: 1,
      lon: 2
    },
    weather: [
      {
        icon: 'icon-name'
      }
    ]
  }

  before(() => {
    const apiKey = sails.config.weatherApi.key
    const baseUrl = sails.config.weatherApi.baseUrl
    const fetch = fetchMock.sandbox()
    fetch.get(`${baseUrl}?q=city-1&appid=${apiKey}`, data)
    fetch.get(`${baseUrl}?q=nocity&appid=${apiKey}`, 404)
    sails.config.globals.fetch = fetch
  })

  after(() => {
    sails.config.globals.fetch = undefined
  })

  it('should return weather', (done) => {
    supertest(sails.hooks.http.app)
      .get('/weather/city')
      .query({q: 'city-1'})
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  }),

  it('should return 404 if not found city', (done) => {
    supertest(sails.hooks.http.app)
      .get('/weather/city')
      .query({q: 'nocity'})
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  })
})

describe('#controllers.weather.coordinates', () => {
  const data = {
    name: "city-1",
    main: {
      temp: 290,
      presure: 10,
      humidity: 1
    },
    wind: {
      speed: 5,
      deg: 27
    },
    clouds: {
      all: ''
    },
    coord: {
      lat: 1,
      lon: 2
    },
    weather: [
      {
        icon: 'icon-name'
      }
    ]
  }
  
  before(() => {
    const apiKey = sails.config.weatherApi.key
    const baseUrl = sails.config.weatherApi.baseUrl
    const fetch = fetchMock.sandbox()
    fetch.get(`${baseUrl}?lat=1&lon=2&appid=${apiKey}`, data)
    fetch.get(`${baseUrl}?lat=0&lon=0&appid=${apiKey}`, 404)
    sails.config.globals.fetch = fetch
  })

  after(() => {
    sails.config.globals.fetch = undefined
  })

  it('should return weather', (done) => {
    supertest(sails.hooks.http.app)
      .get('/weather/coordinates')
      .query({lat: 1, lon: 2})
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  }),

  it('should return 500 if any non-200 code', (done) => {
    supertest(sails.hooks.http.app)
      .get('/weather/coordinates')
      .query({lat: 0, lon: 0})
      .expect(500)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  })
})