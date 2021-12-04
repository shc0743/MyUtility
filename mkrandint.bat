@set "r=%1"
@if NOT "%2"=="" set "r=%r%,%2"
@python -c "from random import randint as _;print(_(%r%))"