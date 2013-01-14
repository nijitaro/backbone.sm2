SRC = $(wildcard *.coffee)
LIB = $(SRC:%.coffee=%.js)

all: build

build: $(LIB)
	coffee -bc $(SRC)

watch:
	coffee --watch -bc $(SRC)

clean:
	rm -f *.js

test-server:
	@(cd tests; python -m SimpleHTTPServer)

test:
	$(MAKE) -j2 test-server watch
