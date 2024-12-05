class LuckySixGame {
  constructor() {
    this.deck = [];
    this.players = [];
    this.dealer = null;
    this.results = [];
    this.suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    this.suitRanking = {
      'Hearts': 14,
      'Diamonds': 13,
      'Clubs': 12,
      'Spades': 11
    };
    this.ranking = {
      'A': 14,
      'K': 13,
      'Q': 12,
      'J': 11,
      '10': 10,
      '9': 9,
      '8': 8,
      '7': 7,
      '6': 6,
      '5': 5,
      '4': 4,
      '3': 3,
      '2': 2
    };
    this.values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  }

  // Initialize deck with card values
  initDeck() {
    this.deck = [];
    for (let suit of this.suits) {
      for (let value of this.values) {
        this.deck.push({ value, suit });
      }
    }
  }

  // Shuffle the deck
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // Deal 5 cards to each player and dealer
  dealCards() {
    this.players = [];
    for (let i = 1; i <= 4; i++) {
      this.players.push({ id: i, cards: [this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop()] });
    }
    // this.dealer = { id: 'dealer', cards: [this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop()] };
  }

  checkFlush(back) {
    const suits = back.map(card => card.suit);
    const isSameSuit = suits.every(suit => suit === suits[0]);
    return isSameSuit
  }
  checkTrips(back) {
    const cardsValue = back.map(card => card.value);
    const isSameCardValue = cardsValue.every(value => value === cardsValue[0]);
    return isSameCardValue
  }
  checkStraightFlush(back) {
    const royalValues = this.values; // Add '10' to complete Royal Flush sequence
    const suits = back.map(card => card.suit);


    const isSameSuit = suits.every(suit => suit === suits[0]);
    if (!isSameSuit) {
      return false;
    }

    const sortedCards = back.sort((a, b) => royalValues.indexOf(a.value) - royalValues.indexOf(b.value));

    const expectedOrder = this.values;
    const isStraight = sortedCards.every((card, index) => card.value === expectedOrder[index]);

    return isStraight;
  }
  checkRoyalStraightFlush(back) {
    const royalValues = ['A', 'K', 'Q', 'J', '10']; // Add '10' to complete Royal Flush sequence
    const suits = back.map(card => card.suit);

    const isRoyal = back.every(card => royalValues.includes(card.value));
    if (!isRoyal) {
      return false;
    }

    const isSameSuit = suits.every(suit => suit === suits[0]);
    if (!isSameSuit) {
      return false;
    }

    const sortedCards = back.sort((a, b) => royalValues.indexOf(a.value) - royalValues.indexOf(b.value));

    const expectedOrder = ['10', 'J', 'Q', 'K', 'A'];
    const isStraight = sortedCards.every((card, index) => card.value === expectedOrder[index]);

    return isStraight;
  }
  checkStraight(back) {
    const royalValues = this.values; // Add '10' to complete Royal Flush sequence

    const sortedCards = back.sort((a, b) => royalValues.indexOf(a.value) - royalValues.indexOf(b.value));

    const expectedOrder = this.values;
    const isStraight = sortedCards.every((card, index) => card.value === expectedOrder[index]);

    return isStraight;
  }
  checkPair(back) {
    const seenValues = new Set();

    for (let card of back) {
      if (seenValues.has(card.value)) {
        return true;
      }
      seenValues.add(card.value);
    }

    return false;
  }
  // checkHighestCard(back) {
  //   // Map the cards to their corresponding rankings
  //   const valuesOfCards = back.map(card => this.ranking[card?.value]);

  //   // Find the highest value in the array
  //   const highestValue = Math.max(...valuesOfCards);

  //   // Find the card with the highest value
  //   const highestCard = back.find(card => this.ranking[card.value] === highestValue);

  //   return highestCard;  // Return the card with the highest value
  // }



  checkCartTypeRanking(player) {
    const theBack = [player?.position[0], player?.position[1], player?.position[2]];
    const theMiddle = [player?.position[3], player?.position[4]];
    const theFront = [player?.position[5]]


    if (theBack) {
      if (this.checkRoyalStraightFlush(theBack)) {
        player.back = 'Royal Straight Flush';
      } else if (this.checkStraightFlush(theBack)) {
        player.back = 'Straight Flush';
      } else if (this.checkTrips(theBack)) {
        player.back = 'Trips';
      } else if (this.checkFlush(theBack)) {
        player.back = 'Flush';
      } else if (this.checkStraight(theBack)) {
        player.back = 'Straight';
      } else if (this.checkPair(theBack)) {
        player.back = 'Pair';
      } else {
        player.back = 'High Card';
      }
    }
    if (theMiddle) {
      if (this.checkRoyalStraightFlush(theMiddle)) {
        player.middle = 'Royal Straight Flush';
      } else if (this.checkStraightFlush(theMiddle)) {
        player.middle = 'Straight Flush';
      } else if (this.checkTrips(theMiddle)) {
        player.middle = 'Trips';
      } else if (this.checkFlush(theMiddle)) {
        player.middle = 'Flush';
      } else if (this.checkStraight(theMiddle)) {
        player.middle = 'Straight';
      } else if (this.checkPair(theMiddle)) {
        player.middle = 'Pair';
      } else {
        player.middle = 'High Card';
      }
    }

    if (theFront) {
      player.front = 'High Card';
    }

    return player

  }
  checkCrack(player) {

    console.log(player?.position);

    const valuesOfCards = player?.position.map(card => this.ranking[card?.value])
    const theBack = [valuesOfCards[0], valuesOfCards[1], valuesOfCards[2]];
    const theMiddle = [valuesOfCards[3], valuesOfCards[4]];
    const theFront = [valuesOfCards[5]]

    for (let i = 0; i < theFront.length; i++) {
      for (let j = 0; j < theMiddle.length; j++) {
        if (theFront[i] < theMiddle[j]) {
          console.log('player.crack = true first')
          return true
        }
        for (let k = 0; k < theBack.length; k++) {
          if (theFront[i] < theBack[k]) {
            console.log('player.crack = true secon')
            return true
          } else if (theMiddle[j] < theBack[k]) {
            console.log('player.crack = true Third')
            player.crack = true
            return true
          }

        }

      }
    }
    return false

  }
  // Calculate results for each player
  calculateResults(players) {
    console.log('players', players)
    console.log('playerssss', players[0])

    for (let i = 0; i < players.length; i++) {
      const storedCrack = this.checkCrack(players[i]);
      if (storedCrack === true) {
        players[i].crack = true
      } else {
        const updatedPlayer = this.checkCartTypeRanking(players[i])
        players[i] = updatedPlayer;
      }
    }

    console.log('players')

    this.players = players
  }

  // API Routes
  shuffle(req, res) {
    this.initDeck();
    this.shuffleDeck();
    this.dealCards();
    res.json({ message: 'Deck shuffled and cards dealt', players: this.players, dealer: this.dealer });
  }

  game(req, res) {
    res.json({ players: this.players, dealer: this.dealer });
  }

  finish(req, res) {
    console.log('req', req?.body?.players)
    this.calculateResults(req?.body?.players);
    res.json({ results: this.results, players: this.players });
  }

  evaluateCards(cards) {
    const total = this.getCardPoints(cards).reduce((acc, val) => acc + val, 0);
    let result = "No Bull";

    if (this.checkNoBull(cards)) {
      result = "No Bull";
    } else if (this.checkFourFaceBull(cards)) {
      result = "4-face-bull";
    } else if (this.checkFiveFaceBull(cards)) {
      result = "5-face-bull";
    } else if (this.checkBomb(cards)) {
      result = "Bomb";
    } else if (this.checkSmallBull(cards)) {
      result = "5-small-bull";
    } else if (this.checkBullBull(cards)) {
      result = "Bull-Bull";
    } else {
      result = `Bull ${total % 10}`;
    }

    return result;
  }

  // API route to evaluate cards sent from frontend
  evaluate(req, res) {
    const { cards } = req.body;
    const result = this.evaluateCards(cards);
    res.json({ result });
  }
};

module.exports = LuckySixGame