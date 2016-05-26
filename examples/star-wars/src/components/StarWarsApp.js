/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import Relay from 'react-relay';
import StarWarsShip from './StarWarsShip';
import AddShipMutation from '../mutation/AddShipMutation';

class StarWarsApp extends React.Component {
  constructor() {
    super();
    this.state = {factionId: 1, shipName: ''};
  }

  handleAddShip() {
    const name = this.state.shipName;
    const faction = this.props.factions[this.state.factionId];
    Relay.Store.commitUpdate(new AddShipMutation({name, faction}));
    this.setState({shipName: ''});
  }

  render() {
    var {factions} = this.props;
    return (
      <ol>
        {factions.map(faction => (
          <li key={faction.id}>
            <h1>{faction.name}</h1>
            <ol>
              {faction.ships.edges.map(edge => (
                <li key={edge.node.id}><StarWarsShip ship={edge.node} /></li>
              ))}
            </ol>
          </li>
        ))}
          <li>
            <h1>Introduce Ship</h1>
            <ol>
              <li>
                Name:
                <input
                  type="text"
                  value={this.state.shipName}
                  onChange={e => this.setState({shipName: e.target.value})}
                />
              </li>
              <li>
                Faction:
                <select
                  value={this.state.factionId}
                  onChange={e => this.setState({factionId: e.target.value})}
                >
                  <option value="0">Galactic Empire</option>
                  <option value="1">Alliance to Restore the Republic</option>
                </select>
              </li>
              <li>
                <button onClick={this.handleAddShip.bind(this)}>Add Ship</button>
              </li>
            </ol>
          </li>
      </ol>
    );
  }
}

export default Relay.createContainer(StarWarsApp, {
  fragments: {
    factions: () => Relay.QL`
      fragment on Faction @relay(plural: true) {
        id,
        factionId,
        name,
        ships(first: 10) {
          edges {
            node {
              id,
              ${StarWarsShip.getFragment('ship')}
            }
          }
        }
        ${AddShipMutation.getFragment('faction')},
      }
    `,
  },
});
