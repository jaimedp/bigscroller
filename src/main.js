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

class InfList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visibleStart: 0,
      visibleEnd: 0,
      sizes: initSizes(props.children, -1)
    };

    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    this.measureElements();
    this.computeVisibleItems();
    this.shouldScroll = true;
  }

  componentDidUpdate() {
    this.measureElements();
    if (this.props.flip) {
      this.scrollIntoView();
      // this.adjustScrollPos();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      const minRowHeight = nextProps.minRowHeight || this.props.minRowHeight;
      this.shouldScroll = true;
      this.setState({prefix: initPrefix(nextProps.children, minRowHeight)})
    }
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

    this.clientHeight = this._div.clientHeight;


    // this.setState({ itemHeightAvg: avg });
  }

  adjustScrollPos() {
    if (this.prevScrollHeight !== this._div.scrollHeight) {
      const delta = this.prevScrollHeight - this._div.scrollHeight;
      this.prevScrollHeight = this._div.scrollHeight;
      this.scrollAdjustment = true;
      this._div.scrollTop -= delta;
    }
  }

  computeVisibleItems() {
    // let count = 0;
    // const sum = (this.state.sizes.reduce((a, el) => {
    //   if (el >= 0) {
    //     count++;
    //     a += el;
    //   }
    //   return a;
    // }, 0));

    // const avg = count > 0 ? sum / count : this.props.minRowHeight;

    // console.log('avg', avg);

    // debugger;
    const prefix = makePrefixArray(this.state.sizes, this.props.minRowHeight);
    const visibleHeight = this.clientHeight;
    const top = this.currentScrollTop || this._div.scrollTop;
    const bottom = top + visibleHeight;
    const scrollHeight = this._div.scrollHeight;

    let lastRowIndex, lastRowPos;
    let firstIndex;
    let visibleRows;
    if (this.props.flip) {
      lastRowIndex = prefix.length - 1;
      if (scrollHeight > visibleHeight) {
        while (prefix[lastRowIndex] > top + visibleHeight) lastRowIndex--;
      }

      lastRowPos = prefix[lastRowIndex];
      firstIndex = lastRowIndex;

      while (lastRowPos - prefix[firstIndex - 1] < visibleHeight) firstIndex--;
      visibleRows = lastRowIndex - firstIndex + 1;
    } else {
      firstIndex = 0;
      while (prefix[firstIndex] < top) firstIndex++;

      visibleRows = 0;
      while (prefix[firstIndex + visibleRows] < top + visibleHeight) visibleRows++;
      lastRowIndex = Math.min(firstIndex + visibleRows, prefix.length-1);
      lastRowPos = prefix[lastRowIndex];
    }

    const firstRowPos = firstIndex ? prefix[firstIndex - 1] : 0

    const buffer = 1;
    const totalHeight = prefix[prefix.length - 1];
    const visibleStart = Math.max(0, firstIndex - 1);
    const visibleEnd = Math.min(prefix.length, firstIndex + visibleRows + 1);
    const removedFromTop = firstRowPos;
    const removedFromBottom = totalHeight - lastRowPos;

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
    if (this.shouldScroll) {
      const domNode = this._div;
      setTimeout(() => {
        domNode.scrollTop =  Number.MAX_SAFE_INTEGER;
      }, 0)
      this.shouldScroll = false;
    }
  }

  onScroll(e) {
    this.currentScrollTop = this._div.scrollTop
    if (!this.scrollAdjustment) {
      window.requestAnimationFrame(() => this.computeVisibleItems());
    } else {
      this.scrollAdjustment = false;
    }
    // this.computeVisibleItems();
    // console.log(this._div.scrollTop);
  }

  render() {
    let visible = [];

    for (let j=this.state.visibleStart; j<this.state.visibleEnd; j++) {
      visible.push(<InfListItem index={j} key={j}>{this.props.children[j]}</InfListItem>);
    }

    const debugInfo = (
      <ul>
        {Object.keys(this.state).map((key, i) => <li key={i}>{key}: {this.state[key]}</li>)}
        <li>Total items: {this.props.children.length}</li>
        <li>Items rendered: {visible.length}</li>
      </ul>
    );


    return (
      <div>
        <div className="outer-scroller" style={this.props.style} onScroll={this.onScroll} ref={(e) => this._div = e}>
          <div className="inner-scroller">
            <div className="spacer top" style={{height: this.state.offsetTop}}></div>
            {visible}
            <div className="spacer bottom"style={{height: this.state.offsetBottom}}></div>
          </div>
        </div>
        {debugInfo}
        <button onClick={() => this._div.scrollTop--}>less</button>
        <button onClick={() => this._div.scrollTop++}>more</button>
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

      // <InfList>{el}</InfList>
    return (
      <InfList style={style}>
        {el}
      </InfList>
    );
  }
}


ReactDOM.render(<Main />, document.getElementById('container'));

