#!/Library/Frameworks/Python.framework/Versions/3.6/bin/python3

import requests
import json

s = requests.Session()


def get_favorites():
    r = s.get('http://localhost:1337/favorites')
    print("""
    GET /favorites
    Status:   {}
    Response: {}
    """.format(r.status_code, r.content.decode('utf-8')))


def add_favorite(city):
    parameters = { 'cityName': city }
    r = s.post('http://localhost:1337/favorites', params=parameters)
    print("""
    POST /favorites
    City:     {}
    Status:   {}
    Response: {}
    """.format(city, r.status_code, r.content.decode('utf-8')))


def remove_favorite(city):
    parameters = { 'cityName': city }
    r = s.delete('http://localhost:1337/favorites', params=parameters)
    print("""
    DELETE /favorites
    City:     {}
    Status:   {}
    Response: {}
    """.format(city, r.status_code, r.content.decode('utf-8')))


def fetch_weather_by_coord(lat, lon):
    parameters = { 'lat': lat, 'lon': lon }
    r = s.get('http://localhost:1337/weather/coordinates', params=parameters)
    print("""
    GET /weather/coordinates
    Coord:    ({}, {})
    Status:   {}
    Response: {}
    """.format(lat, lon, r.status_code, r.content.decode('utf-8')))


def fetch_weather_by_city(name):
    parameters = { 'q': name }
    r = s.get('http://localhost:1337/weather/city', params=parameters)
    print("""
    GET /weather/city
    City:     {}
    Status:   {}
    Response: {}
    """.format(name, r.status_code, r.content.decode('utf-8')))


get_favorites()
add_favorite('SPb')
add_favorite('Moscow')
get_favorites()
add_favorite('spb')
get_favorites()
remove_favorite('moscow')
get_favorites()
fetch_weather_by_coord(59, 30)
fetch_weather_by_city('Saint Petersburg')
fetch_weather_by_city('nasdkjnaskdj')