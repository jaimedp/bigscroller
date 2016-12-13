
// const el = new Array(1000).fill(true).map((__, i) => {
//   const h = Math.random() * 100 + 25 + 'px';
//   const style = {height: h, borderBottom: 'solid 1px red'};
//   return <div style={style} key={i}>{i}</div>;
// });

class Main extends React.Component {
  componentDidMount() {
  }

  render() {
    const el = new Array(1000).fill(true).map((__, i) => {
      const h = Math.random() * 100 + 25 + 'px';
      const style = {height: h, borderBottom: 'solid 1px red'};
      return <div style={style} key={i}>{i}</div>;
    });

    const style = {
      marginTop: 0,
      overflow: 'auto',
      height: 400,
      border: 'solid 1px blue',
      transform: 'translateZ(0)'
    };

    const renderItem = (index, key) => (el[index]);

      // <InfList>{el}</InfList>
    return (
      <div style={{overflow: "auto", maxHeight: 400}}>
          <ReactList
            ref={(c) => this._list = c}
            itemRenderer={renderItem}
            length={el.length}
            initialIndex={1000}
            type="variable" />
      </div>
    );
  }
}


ReactDOM.render(<Main />, document.getElementById('container'));
