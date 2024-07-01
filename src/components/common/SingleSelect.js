import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Select from './Select';
import { scale, moderateScale } from 'react-native-size-matters';

const SingleSelect = ( props ) => {

  return (

      <View style={ styles.selectStyle }>
        <Text style={ styles.labelStyle }>{ props.label }</Text>
          <View style={ styles.inputStyle }>
            <Select
              reset={ props.reset } // used to close the dropdowns / text inputs when form is reset
              onPressElement={ props.onPressElement }
              onBlurElement={ props.onBlurElement }
              onPress={ props.onPress }
              single={ true }
              items={ props.items }
              uniqueKey={ props.uniqueKey || "id" }
              displayKey="name"
              onSelectedItemsChange={ props.onSelectedItemsChange }
              selectedItems={ props.selectedItems }
              onChangeInput={ props.onChangeInput}
              onAddItem={ props.onAddItem }
              canAddItems={ props.canAddItems } 
              fixedHeight={ false } 
              hideDropdown={ false } 
              hideSubmitButton={ false } 
              hideTags={ false }
              selectText={ props.selectText }
              searchInputPlaceholderText="Search Items..."
              searchInputStyle={{ 
                color: 'grey', 
                fontSize: moderateScale(18, .2) 
              }}
              styleMainWrapper={{ width: '100%' }}
              styleDropdownMenuSubsection={{  
                height: moderateScale(50, .2), 
                paddingLeft: moderateScale(10, .2),
                justifyContent: 'center',
                borderRadius: 5
              }}
              styleInputGroup={ [
                props.styleInputGroup, { 
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
                paddingTop: 10, 
                justifyContent: 'center',
              } ] }
              styleListContainer={ props.styleListContainer }
              styleRowList={{ 
                borderRadius: 10,
                borderBottomWidth: 2, 
                borderColor: 'lightgrey', 
                padding: scale(5)
              }}
              styleTextDropdown={{}}
              fontSize={ moderateScale(18, .2) }
              itemFontSize={ moderateScale(18,.2) }
              itemTextColor="#000"
              tagRemoveIconColor="red"
              tagBorderColor="grey"
              tagTextColor="grey"
              textColor="black"
              selectedItemTextColor="#CCC"
              selectedItemIconColor="#CCC"
              submitButtonColor="green"
              submitButtonText="Submit"
              textInputProps={{ 
                clearButtonMode: 'always', 
                autoFocus: false, 
                autoCapitalize: props.autoCapitalize || 'none', 
                autoCorrect: props.autoCorrect || false,
                onFocus: props.onFocus,
                onBlur: props.onBlur
              }}
              flatListProps={{ maxHeight: Dimensions.get('window').height / 3 }}
              />
          </View>
      </View>

  );
};

export { SingleSelect };

const styles = { 
  selectStyle: {
    flexDirection: 'row',
    marginTop: scale(5),
    marginBottom: scale(5),
  },
  labelStyle: {
    fontSize: moderateScale(18,.2),
    marginRight: scale(5),
    marginTop: scale(10)
  },
  inputStyle: {
    flex: 1
  }
};