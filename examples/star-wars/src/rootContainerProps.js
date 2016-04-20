import StarWarsApp from './components/StarWarsApp';
import StarWarsAppHomeRoute from './routes/StarWarsAppHomeRoute';

export default {
    Container: StarWarsApp,
    queryConfig: new StarWarsAppHomeRoute({
        factionNames: ['empire', 'rebels']
    }),
};
