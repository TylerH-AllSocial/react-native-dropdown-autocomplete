import React, {Component, Fragment} from "react";
import {findNodeHandle, ActivityIndicator, TextInput, View} from "react-native";
import {string, bool, number, func} from "prop-types";
import Dropdown from "../Dropdown";
import {capitalizeFirstLetter} from "../../utils/string";
import {styles} from "./Autocomplete.styles";
import {get} from "../../utils/api";
import {WAIT_INTERVAL, NO_DATA} from "../../constants/Autocomplete";
import {theme} from "../../constants/Theme";
import locales from "../../constants/Locales";

class Autocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      filteredItems: [],
    };
    this.mounted = false;
    this.timer = null;
    this.dropdown = React.createRef();
    this.container = React.createRef();
    this.setItem = this.setItem.bind(this);
    this.triggerChange = this.triggerChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.promisifySetState = this.promisifySetState.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleInputChange(text) {
    const {onChangeText, minimumCharactersCount, waitInterval} = this.props;
    if (onChangeText) {
      onChangeText(text);
    }
    clearTimeout(this.timer);
    if (text.length > minimumCharactersCount) {
      this.setState(
        {
          loading: true,
        },
        () => {
          if (this.mounted) {
            this.timer = setTimeout(this.triggerChange, waitInterval);
          }
        },
      );
    } else {
      this.setState({loading: false});
    }
  }

  handleKeyPress(nativeEvent) {
    const { items } = this.state;
    const { inputValue } = this.props;
    if (!items || !items.length) return;
    if (nativeEvent.key === 'Backspace') {
      if (inputValue.length === 1 && inputValue.includes('@') && this.dropdown.current) {
        this.dropdown.current.close();
      }
    }
  }

  promisifySetState(state) {
    return (
      this.mounted &&
      new Promise(resolve => this.setState(state, () => resolve()))
    );
  }

  async triggerChange() {
    const {items} = this.state;
    let { inputValue } = this.props;
    const { fetchData, fetchDataUrl, valueExtractor, customInputParser } = this.props;

    if (typeof customInputParser === 'function') {
        inputValue = customInputParser(inputValue)
        if (!inputValue && this.dropdown.current) {
          this.dropdown.current.close();
          return;
        }
        if (inputValue.length === 1 && inputValue.includes('@') && this.dropdown.current) {
          this.dropdown.current.close();
          return;
        }
    }

    if (fetchData) {
      try {
        const response = await fetchData(inputValue);
        if (response.length && this.mounted) {
          this.setState({items: response, loading: false});
        } else {
          this.setState({items: [NO_DATA], loading: false});
        }
        if (this.dropdown.current) {
          this.dropdown.current.onPress(this.container);
        }
      } catch (error) {
        throw new Error(error);
      }
    } else if (fetchDataUrl) {
      try {
        const response = await get(fetchDataUrl, {search: inputValue});
        if (response.length && this.mounted) {
          this.setState({items: response, loading: false});
        } else {
          this.setState({items: [NO_DATA], loading: false});
        }
        if (this.dropdown.current) {
          this.dropdown.current.onPress(this.container);
        }
      } catch (error) {
        throw new Error(error);
      }
    } else {
      const filteredItems = items.filter(item => {
        return (
          valueExtractor(item)
            .toLowerCase()
            .search(inputValue.toLowerCase()) !== -1
        );
      });

      if (filteredItems.length && this.mounted) {
        await this.promisifySetState({
          filteredItems,
          loading: false,
        });
      } else {
        await this.promisifySetState({
          filteredItems: [NO_DATA],
          loading: false,
        });
      }

      if (this.dropdown.current) {
        this.dropdown.current.onPress(this.container);
      }
    }
  }

  setItem(value) {
    const {index, handleSelectItem, valueExtractor, resetOnSelect} = this.props;
    if (handleSelectItem !== undefined || handleSelectItem !== null) {
      handleSelectItem(value, index);
    }
  }

  clearInput() {
    if (this.props.onChangeText){
      this.props.onChangeText('');
    }
  }

  componentDidMount() {
    const {data} = this.props;
    this.mounted = true;
    if (data) {
      this.setState({items: data});
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    this.mounted = false;
  }

  handleBlur() {
    clearTimeout(this.timer);
    this.setState({loading: false});
    if (this.dropdown.current) {
      this.dropdown.current.close();
    }
  }

  render() {
    const { items, loading, filteredItems} = this.state;
    const {
      placeholder,
      inputValue,
      scrollToInput,
      renderIcon,
      inputContainerStyle,
      inputStyle,
      spinnerStyle,
      spinnerSize,
      listHeader,
      autoCorrect,
      keyboardType,
      spinnerColor,
      placeholderColor,
      data,
      textInputProps,
      disableFullscreenUI,
      hideSpinner,
      ...dropdownProps
    } = this.props;

    return (
      <Fragment>
        <View style={[styles.inputContainerStyle, inputContainerStyle]}>
          {renderIcon && renderIcon()}
          <TextInput
            ref={ref => {
              this.container = ref;
            }}
            {...textInputProps}
            onBlur={event => this.handleBlur(event)}
            style={[styles.input, inputStyle]}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor || theme.textSecondary}
            disableFullscreenUI={disableFullscreenUI}
            value={inputValue}
            autoCorrect={autoCorrect}
            keyboardType={keyboardType}
            onChangeText={(text) => this.handleInputChange(text)}
            onKeyPress={({ nativeEvent }) => this.handleKeyPress(nativeEvent)}
            onFocus={event => {
              if (scrollToInput) {
                scrollToInput(findNodeHandle(event.target));
              }
            }}
          />
          {loading && !hideSpinner &&  (
            <ActivityIndicator
              style={[styles.spinner, spinnerStyle]}
              size={spinnerSize}
              color={spinnerColor || theme.primary}
            />
          )}
        </View>
        {items && items.length > 0 && (
          <Dropdown
            ref={this.dropdown}
            dropdownPosition={0}
            data={data ? filteredItems : items}
            listHeader={listHeader}
            inputValue={inputValue}
            onChangeValue={this.setItem}
            {...dropdownProps}
          />
        )}
      </Fragment>
    );
  }
}

Autocomplete.defaultProps = {
  placeholder: locales.components.Autocomplete.placeholder,
  spinnerSize: "small",
  autoCorrect: false,
  keyboardType: "default",
  minimumCharactersCount: 2,
  highlightText: true,
  waitInterval: WAIT_INTERVAL,
  resetOnSelect: false,
  handleSelectItem: () => {}
};

Autocomplete.propTypes = {
  placeholder: string,
  spinnerSize: string,
  listHeader: string,
  placeholderColor: string,
  fetchDataUrl: string,
  minimumCharactersCount: number,
  waitInterval: number,
  highlightText: bool,
  rightContent: bool,
  autoCorrect: bool,
  keyboardType: string,
  resetOnSelect: bool,

  valueExtractor: func,
  renderIcon: func,
  scrollToInput: func,
  handleSelectItem: func,
  onDropdownClose: func,
  onDropdownShow: func,
  rightTextExtractor: func,
  fetchData: func,
};

export default Autocomplete;
