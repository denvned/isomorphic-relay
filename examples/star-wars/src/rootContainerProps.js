import StarWarsApp from './components/StarWarsApp';
import StarWarsAppHomeRoute from './routes/StarWarsAppHomeRoute';

export default {
    Component: StarWarsApp,
    route: new StarWarsAppHomeRoute({
        factionNames: ['empire', 'rebels']
    }),
};
