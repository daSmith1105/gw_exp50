import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Select from './Select';

const MultipleSelect = (props) => {
  const { selectStyle, labelStyle, inputStyle } = styles;
  const {
    label,
    items,
    ref, 
    onSelectedItemsChange,
    selectedItems,
    onChangeInput,
    onAddItem,
    selectText,
    searchInputPlaceholderText,
    canAddItems,
    keyboardVisible,
    autoCapitalize,
    autoCorrect,
    onFocus,
    onBlur,
    keyboardOpen
  } = props;

  return(
    <View style={ selectStyle }>
      <Text style={ labelStyle }>{ label }</Text>
      <View style={ inputStyle }>
        <Select
          single={false }
          items={ items }
          uniqueKey="id"
          displayKey="name"
          ref={ ref }
          onSelectedItemsChange={ onSelectedItemsChange }
          selectedItems={ selectedItems }
          onChangeInput={ onChangeInput }
          onAddItem={ onAddItem }
          canAddItems={ canAddItems || false } 
          fixedHeight={ false } 
          hideDropdown={ false } 
          hideSubmitButton={ false } 
          hideTags={ false }
          selectText={ selectText }
          searchInputPlaceholderText={ searchInputPlaceholderText || "Search Items..." }
          searchInputStyle={{ 
            color: 'grey', 
            fontSize: 18 
          }}
          styleMainWrapper={{ 
            marginTop: 5, 
            marginBottom: 5, 
            height: keyboardVisible ? 70 : '100%',
            width: '95%',
            marginRight: 'auto',
            marginLeft: 'auto'
          }}
          styleDropdownMenuSubsection={{  
            height: 50, 
            paddingLeft: 10, 
            marginBottom: 2, 
            marginTop: 2, 
            justifyContent: 'center' 
          }}
          styleInputGroup={{ 
            paddingTop: 10, 
            justifyContent: 'center'
          }}
// THIS CONTOLS THE LIST HEIGHT
          styleListContainer={{ 
            height: keyboardOpen === true ? 100 : Dimensions.get('window').height / 2,
            color: 'white'
          }}
          styleRowList={{ 
            borderBottomWidth: 2, 
            borderColor: 'lightgrey', 
            padding: 5 ,
            width: '100%'
          }}
          styleTextDropdown={{}}
          fontSize= { 18 }
          itemFontSize={ 18 }
          itemTextColor="#000"
          tagRemoveIconColor="red"
          tagBorderColor="grey"
          tagTextColor="grey"
          textColor="black"
          selectedItemTextColor="#CCC"
          selectedItemIconColor="#CCC"
          submitButtonColor="green"
          submitButtonText="Done"
          textInputProps={{ 
            clearButtonMode: 'always', 
            autoCapitalize: autoCapitalize || 'none', 
            autoCorrect: autoCorrect || false, 
            keyboardApperance: 'dark', 
            onFocus: onFocus,
            onBlur: onBlur 
          }}
          />
        </View>
    </View>   
  );
};


export { MultipleSelect };

const styles = { 
  selectStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  labelStyle: {
    fontSize: 18,
    marginRight: 5
  },
  inputStyle: {
    flex: 1
  }
};


