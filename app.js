const express = require('express');
const cors = require('cors');

class BullBullPoker {
  constructor() {
    this.deck = [];
    this.players = [];
    this.dealer = null;
    this.results = [];
    this.suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
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
      this.players.push({ id: i, cards: [this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop()] });
    }
    this.dealer = { id: 'dealer', cards: [this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop(), this.deck.pop()] };
  }

  // Convert card values to numerical points
  getCardPoints(cards) {
    return cards.map(card => {
      if (card.value === 'J' || card.value === 'Q' || card.value === 'K') return 10;
      if (card.value === 'A') return 1;
      return parseInt(card.value);
    });
  }

  // Check for 5-small-bull: sum of points < 10 and all cards have less than 5 points
  checkSmallBull(cards) {
    const values = this.getCardPoints(cards);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const allLessThan5 = values.every(val => val < 5);
    return allLessThan5 && sum < 10;
  }

  // Check for Bomb: four cards have the same value, and the fifth card is optional
  checkBomb(cards) {
    const values = this.getCardPoints(cards);
    const valueCount = values.reduce((count, value) => {
      count[value] = (count[value] || 0) + 1;
      return count;
    }, {});
    return Object.values(valueCount).includes(4);
  }

  // Check for 5-face-bull: All cards are face cards (J, Q, K)
  checkFiveFaceBull(cards) {
    const faceCards = ['J', 'Q', 'K'];
    const values = cards.map(card => card.value);
    return values.every(value => faceCards.includes(value));
  }

  // Check for 4-face-bull: Four face cards (J, Q, K) and one 10
  checkFourFaceBull(cards) {
    const faceCards = ['J', 'Q', 'K'];
    const values = cards.map(card => card.value);
    const faceCount = values.filter(value => faceCards.includes(value)).length;
    const hasTen = values.includes('10');
    return faceCount === 4 && hasTen;
  }

  // Check for Bull-Bull: Sum of three cards is multiple of 10, and sum of the other two cards is also multiple of 10
  checkBullBull(cards) {
    const values = this.getCardPoints(cards);

    // Check all combinations of 3 cards
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        for (let k = j + 1; k < values.length; k++) {
          const sumThree = values[i] + values[j] + values[k];
          if (sumThree % 10 === 0) {
            const remainingCards = values.filter((_, index) => index !== i && index !== j && index !== k);
            const sumTwo = remainingCards[0] + remainingCards[1];
            if (sumTwo % 10 === 0) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // Check for No Bull: No combination of three cards sum to a multiple of 10
  checkNoBull(cards) {
    const values = this.getCardPoints(cards);

    // Check all combinations of 3 cards
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        for (let k = j + 1; k < values.length; k++) {
          const sum = values[i] + values[j] + values[k];
          if (sum % 10 === 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Calculate results for each player
  calculateResults() {
    this.results = [];
    this.players.forEach(player => {
      const total = this.getCardPoints(player.cards).reduce((acc, val) => acc + val, 0);
      let result = "No Bull"; 

      // if (this.checkSmallBull(player.cards)) {
      //   result = "5-small-bull";
      // } else if (this.checkBomb(player.cards)) {
      //   result = "Bomb";
      // } else if (this.checkFiveFaceBull(player.cards)) {
      //   result = "5-face-bull";
      // } else if (this.checkFourFaceBull(player.cards)) {
      //   result = "4-face-bull";
      // } else if (this.checkBullBull(player.cards)) {
      //   result = "Bull-Bull";
      // } else if (this.checkNoBull(player.cards)) {
      //   result = "No Bull";
      // } else {
      //   result = `Bull ${total % 10}`;
      // }
      if (this.checkNoBull(player.cards)) {
        result = "No Bull";
      } else if (this.checkBullBull(player.cards)) {
        result = "Bull-Bull";
      } else if (this.checkFourFaceBull(player.cards)) {
        result = "4-face-bull";
      } else if (this.checkFiveFaceBull(player.cards)) {
        result = "5-face-bull";
      } else if (this.checkBomb(player.cards)) {
        result = "Bomb";
      } else if (this.checkSmallBull(player.cards)) {
        result = "5-small-bull";
      } else {
        result = `Bull ${total % 10}`;
      }

      this.results.push({
        player: player.id,
        total,
        result
      });
    });

    const dealerTotal = this.getCardPoints(this.dealer.cards).reduce((acc, val) => acc + val, 0);
    let dealerResult = "No Bull"; 

    // if (this.checkSmallBull(this.dealer.cards)) {
    //   dealerResult = "5-small-bull";
    // } else if (this.checkBomb(this.dealer.cards)) {
    //   dealerResult = "Bomb";
    // } else if (this.checkFiveFaceBull(this.dealer.cards)) {
    //   dealerResult = "5-face-bull";
    // } else if (this.checkFourFaceBull(this.dealer.cards)) {
    //   dealerResult = "4-face-bull";
    // } else if (this.checkBullBull(this.dealer.cards)) {
    //   dealerResult = "Bull-Bull";
    // } else if (this.checkNoBull(this.dealer.cards)) {
    //   dealerResult = "No Bull";
    // } else {
    //   dealerResult = `Bull ${dealerTotal % 10}`;
    // }
    if (this.checkNoBull(this.dealer.cards)) {
      dealerResult = "No Bull";
    } else if (this.checkBullBull(this.dealer.cards)) {
      dealerResult = "Bull-Bull";
    } else if (this.checkFourFaceBull(this.dealer.cards)) {
      dealerResult = "4-face-bull";
    } else if (this.checkFiveFaceBull(this.dealer.cards)) {
      dealerResult = "5-face-bull";
    } else if (this.checkBomb(this.dealer.cards)) {
      dealerResult = "Bomb";
    } else if (this.checkSmallBull(this.dealer.cards)) {
      dealerResult = "5-small-bull";
    } else {
      dealerResult = `Bull ${dealerTotal % 10}`;
    }

    this.results.push({
      player: 'dealer',
      total: dealerTotal,
      result: dealerResult
    });
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
    this.calculateResults();
    res.json({ results: this.results });
  }

  evaluateCards(cards) {
    const total = this.getCardPoints(cards).reduce((acc, val) => acc + val, 0);
    let result = "No Bull";

    if (this.checkNoBull(cards)) {
      result = "No Bull";
    } else if (this.checkBullBull(cards)) {
      result = "Bull-Bull";
    } else if (this.checkFourFaceBull(cards)) {
      result = "4-face-bull";
    } else if (this.checkFiveFaceBull(cards)) {
      result = "5-face-bull";
    } else if (this.checkBomb(cards)) {
      result = "Bomb";
    } else if (this.checkSmallBull(cards)) {
      result = "5-small-bull";
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
}

// Initialize the Express app and BullBullPoker instance
const app = express();
const pokerGame = new BullBullPoker();
const port = 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.post('/shuffle', (req, res) => pokerGame.shuffle(req, res));
app.get('/game', (req, res) => pokerGame.game(req, res));
app.post('/finish', (req, res) => pokerGame.finish(req, res));
app.post('/evaluate', (req, res) => pokerGame.evaluate(req, res));  // New route

// Start the server
app.listen(port, () => {
  console.log(`Bull Bull Poker server is running at http://localhost:${port}`);
});
