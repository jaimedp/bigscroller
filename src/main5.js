// const React = window.React;

const InfListItem = (props) => {
  return (<div data-index={props.index}>{props.children}</div>);
}

const initSizes = (children, minRowHeight) => children.map(() => minRowHeight);
const makePrefixArray = (arr, avg) => arr.reduce((prev, el, i) => {
  const a = (el) => el >= 0 ? el : avg;
  prev[i] = i === 0 ? a(el) : prev[i-1] + a(el);
  return prev;
}, new Array(arr.length));

const makeReversePrefix = (arr, avg) => makePrefixArray(arr.reverse(), avg).reverse();


class VisibleItems extends React.Component {

  render() {
    const visibleElements = [];

    for (let i=this.props.first; i<this.props.last; i++) {
      visibleElements.push(<InfListItem index={i} key={i}>{this.props.children[i]}</InfListItem>);
    }

    return (<div className={this.props.className}>{visibleElements}</div>);
  }
}



class InfList extends React.Component {
  constructor(props) {
    super(props);

    this.onScroll = this.onScroll.bind(this);

    this.state = {
      renderFirst: 0,
      renderLast: 0,
      visibleFirst: 0,
      visibleLast: 0,
      initial: true,
      sizes: new Array(this.props.children.length).fill(true).map((__) => 50)
    }
  }

  componentDidMount() {
    this.scrollIntoView();
    this.updateScrollPos();
    this.measureElements();
    this.computeVisibleItems();
  }

  componentWillUpdate() {
  }

  componentDidUpdate() {
    this.updateScrollPos();
    this.measureElements();
  }

  componentWillReceiveProps(nextProps) {
  }

  updateScrollPos() {
    this.scrollHeight = this._div.scrollHeight;
    this.scrollTop = this._div.scrollTop;
  }

  measureElements() {
    const elements = this._div.querySelectorAll('.inner-scroller > *:not(.spacer)');
    const knownSizes = [].map.call(elements, (el, i) => {
      const index = Number(el.getAttribute('data-index'));
      // don't access the height prop of the element if we don't have to, sice that causes
      // a re-flow in the rendering engine
      // const height = this.state.sizes[index] >= 0 ? this.state.sizes[index] : el.getBoundingClientRect().height;
      const height = el.getBoundingClientRect().height;
      return {
        height,
        index
      };
    });

    const sizes = knownSizes.reduce((prev, s, i) => {
      prev[s.index] = s.height;
      return prev;
    }, this.state.sizes);
  }

  adjustScrollPos() {
  }

  computeVisibleItems() {
    const reversePrefix = makePrefixArray(this.state.sizes);
    const count = this.props.children.length;
    const scrollTop = this._div.scrollTop;
    const clientHeight = this._div.clientHeight;
    const top = scrollTop;
    const bottom = scrollTop + clientHeight;
    const scrollHeight = this._div.scrollHeight;
    const scrollPer = scrollTop / scrollHeight;

    let lastVisibleIndex = count - 1;
    if (scrollHeight > clientHeight) {
      lastVisibleIndex = Math.ceil(count * scrollPer);
    }
    // const firstVisibleIndex = Math.floor(count * scrollPer);

    // let lastVisibleIndex = reversePrefix.length;
    // while (reversePrefix[lastVisibleIndex] > bottom) lastVisibleIndex--;

    let firstVisibleIndex = lastVisibleIndex;
    while (reversePrefix[lastVisibleIndex] - reversePrefix[firstVisibleIndex] < clientHeight) firstVisibleIndex--;

    this.setState({
      visibleFirst: firstVisibleIndex,
      visibleLast: lastVisibleIndex,
      renderFirst: firstVisibleIndex,
      renderLast: lastVisibleIndex,
      initial: false
    });

  }

  scrollIntoView() {
    this._div.scrollTop += this._div.scrollHeight;
  }

  onScroll(e) {
    if (!this.state.initial)
      this.computeVisibleItems();
  }

  render() {

    const debugInfo = (
      <ul>
        {Object.keys(this.state).map((key, i) => <li key={i}>{key}: {this.state[key]}</li>)}
        <li>Total items: {this.props.children.length}</li>
        <li>Items rendered: {this.state.renderLast - this.state.renderFirst + 1}</li>
      </ul>
    );

    return (
      <div>
        <div className="viewport" ref={(d) => (this._div = d) } onScroll={this.onScroll} style={{...this.props.style}}>
          <VisibleItems className="inner-scroller" first={this.state.renderFirst} last={this.state.renderLast + 1}>
            {this.props.children}
          </VisibleItems>
        </div>
        {debugInfo}
      </div>
    );
  }
}

InfList.propTypes = {
  minRowHeight: React.PropTypes.number,
  flip: React.PropTypes.bool
};

InfList.defaultProps = {
  minRowHeight: 60,
  flip: true
};

class Main extends React.Component {
  render() {
    const el = new Array(50).fill(true).map((__, i) => {
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

      // <InfList>{el}</InfList>
    return (
      <InfList style={style}>
        {el}
      </InfList>
    );
  }
}


ReactDOM.render(<Main />, document.getElementById('container'));

