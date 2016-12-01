// const React = window.React;

const InfListItem = (props) => {
  return (<div data-index={props.index}>{props.children}</div>);
}

const initPrefix = (children, minRowHeight) => children.map((_, i) => minRowHeight * (i+1));
const initSizes = (children, minRowHeight) => children.map(() => minRowHeight);

class InfList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visibleStart: 0,
      visibleEnd: 0,
      sizes: initSizes(props.children, props.minRowHeight)
    };

    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    this.measureElements();
    this.computeVisibleItems();
  }

  componentDidUpdate() {
    this.measureElements();
    this.scrollIntoView();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      const minRowHeight = nextProps.minRowHeight || this.props.minRowHeight;
      this.setState({prefix: initPrefix(nextProps.children, minRowHeight)})
    }
  }

  measureElements() {
    const elements = this._div.querySelectorAll('.inner-scroller > *:not(.spacer)');
    const knownSizes = [].map.call(elements, (el, i) => ({ height: el.clientHeight, index: Number(el.getAttribute('data-index'))}));

    const sizes = knownSizes.reduce((prev, s, i) => {
      prev[s.index] = s.height;
      return prev;
    }, this.state.sizes);

    console.log('s', sizes.join(', '));
    // console.log('p', prefix.join(', '));

  }

  computeVisibleItems() {
    const scrollHeight = this._div.scrollHeight;
    const visibleHeight = this._div.clientHeight;
    const top = this._div.scrollTop;

    const rowHeight = 25;
    const totalHeight = this.props.children.length * rowHeight;
    const visibleRows = visibleHeight / 25;
    const visibleStart = Math.max(0, Math.floor(top / rowHeight) - 5);
    const visibleEnd = Math.min(this.props.children.length, visibleStart + visibleRows + 5);
    const offsetTop = top;
    const removedFromTop = visibleStart * rowHeight;
    const removedFromBottom = (this.props.children.length - visibleEnd) * rowHeight
    const offsetBottom = totalHeight - offsetTop - visibleHeight;

    // debugger;

    this.setState({
      initialoffset: this._div.scrollTop,
      visibleRows: visibleRows,
      visibleStart: visibleStart,
      visibleEnd: visibleEnd,
      offsetTop: removedFromTop,
      offsetBottom: removedFromBottom,
      totalHeight: totalHeight
    });
  }

  scrollIntoView() {
    // const domNode = this._div;
    // domNode.scrollTop += domNode.scrollHeight;

    // console.log(domNode.scrollTop);

  }

  onScroll() {
    this.computeVisibleItems();
    // console.log(this._div.scrollTop);
  }

  render() {
    const styles = {
      outer: {
        overflow: 'auto',
        height: 400,
        border: 'solid 1px blue'
      },


      inner: {

      }
    };

    let visible = [];

    for (let j=this.state.visibleStart; j<this.state.visibleEnd; j++) {
      visible.push(<InfListItem index={j} key={j}>{this.props.children[j]}</InfListItem>);
    }

    const debugInfo = (
      <ul>
        {Object.keys(this.state).map((key, i) => <li key={i}>{key}: {this.state[key]}</li>)}
        <li>Items rendered: {visible.length}</li>
      </ul>
    );


    return (
      <div>
        <div className="outer-scroller" style={styles.outer} onScroll={this.onScroll} ref={(e) => this._div = e}>
          <div className="inner-scroller" style={styles.inner}>
            <div className="spacer top" style={{height: this.state.offsetTop}}></div>
            {visible}
            <div className="spacer bottom"style={{height: this.state.offsetBottom}}></div>
          </div>
        </div>
        {debugInfo}
      </div>
    );
  }
}

InfList.propTypes = {
  minRowHeight: React.PropTypes.number
};

InfList.defaultProps = {
  minRowHeight: 25
};

class Main extends React.Component {
  render() {
    const el = new Array(500).fill(true).map((__, i) => {
      const style = {height: 25, borderBottom: 'solid 1px red'};
      return <div style={style} key={i}>{i}</div>;
    });

    return (
      <InfList>{el}</InfList>
    );
  }
}


ReactDOM.render(<Main />, document.getElementById('container'));

