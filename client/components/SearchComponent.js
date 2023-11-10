import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Dimensions, Platform } from 'react-native';
import {
  VStack,
  Input,
  Icon,
  ScrollView,
  HStack,
  List,
  Pressable,
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import useTheme from '../hooks/useTheme';
import { SearchBar } from 'react-native-elements';
import { fetchTrails } from '../store/trailsStore';
import { fetchParks } from '../store/parksStore';
import {
  setSelectedSearchResult,
  clearSearchResults,
  fetchPhotonSearchResults,
} from '../store/searchStore';
import { fetchWeather, fetchWeatherWeek } from '../store/weatherStore';
import useCustomStyles from '~/hooks/useCustomStyles';

const screenWidth = Dimensions.get('window').width;

export const SearchComponent = ({
  onSearch,
  onSearchFocus,
  focused,
  searchText,
  onChangeText,
}) => {
  const dispatch = useDispatch();
  const { currentTheme } = useTheme();
  const styles = useCustomStyles(loadStyles());
  const searchResults =
    useSelector((state) => state.search.searchResults) || [];

  const selectedSearchResult =
    useSelector((state) => state.search.selectedSearchResult) || {};
  const [selectedSearch, setSelectedSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setShowSearchResults(searchText.length > 0);

    const timeout = setTimeout(() => {
      if (!searchText) return;
      dispatch(fetchPhotonSearchResults(searchText));
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchText, dispatch]);

  const getTrailsParksAndWeatherDetails = async () => {
    if (
      !selectedSearchResult ||
      Object.keys(selectedSearchResult).length === 0
    ) {
      return;
    }

    setLoading(true);

    const {
      geometry: { coordinates },
    } = selectedSearchResult;
    const [lon, lat] = coordinates;

    if (!lat || !lon) {
      setLoading(false);
      return;
    }

    try {
      await Promise.all([
        dispatch(fetchTrails({ lat, lon, selectedSearch })),
        dispatch(fetchParks({ lat, lon, selectedSearch })),
        dispatch(fetchWeather({ lat, lon })),
        dispatch(fetchWeatherWeek({ lat, lon })),
      ]);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(getTrailsParksAndWeatherDetails, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [selectedSearch, selectedSearchResult, dispatch]);

  const handleSearch = () => {
    // Implement your search logic here
    if (onSearch) {
      onSearch(searchText);
    }
  };

  const handleSearchResultClick = (result, index) => {
    const {
      properties: { name, osm_id },
    } = result;

    setSelectedSearch(name);
    onChangeText(name);
    setShowSearchResults(false);
    dispatch(setSelectedSearchResult(result));
    if (onSelect) {
      onSelect(result);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <SearchBar
          platform={Platform.OS === 'web' ? 'default' : Platform.OS}
          placeholder="Search..."
          autoFocus
          onChangeText={(text) => onChangeText(text)}
          value={searchText}
          onCancel={onSearchFocus}
          onSubmitEditing={handleSearch}
          containerStyle={focused ? styles.searchBarFocused : styles.searchBar}
        />
        {focused && (
          // Overlay with search results
          <View style={styles.overlay}>
            {/* <Text style={{ color: 'white' }}>Search results go here...</Text> */}
            {searchResults?.length > 0 && (
              <ScrollView
                position="absolute"
                top="100%"
                left="0"
                right="0"
                maxHeight="100"
                borderWidth={1}
                borderColor="gray.200"
                borderRadius={12}
                backgroundColor={currentTheme.colors.white}
                showsVerticalScrollIndicator={false}
                zIndex={10}
              >
                <List space={2} w="100%">
                  {searchResults.map((result, i) => (
                    <Pressable
                      key={`result + ${i}`}
                      onPress={() => {
                        handleSearchResultClick(result, i);
                      }}
                      underlayColor="gray.100"
                    >
                      <HStack space={3}>
                        <Text fontSize="sm" fontWeight="medium">
                          {result.properties.name}
                        </Text>
                        <Text
                          fontSize="sm"
                          color="gray.500"
                          textTransform={'capitalize'}
                        >
                          {result.properties.osm_value}
                        </Text>
                      </HStack>
                    </Pressable>
                  ))}
                </List>
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const loadStyles = () => ({
  container: {
    flex: 1,
    position: 'relative',
  },
  searchBarFocused: {
    top: 0,
    left: 0,
    right: 0,
    width: screenWidth,
    zIndex: 1,
  },
  searchBar: {},
  overlay: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    height: '100%',
    padding: 20,
  },
});
