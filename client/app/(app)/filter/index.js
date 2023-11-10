import {
  VStack,
  Input,
  Icon,
  Text,
  ScrollView,
  HStack,
  List,
  View,
  Pressable,
} from 'native-base';
import {
  RStack,
  RInput,
  RButton,
  RText,
  RScrollView,
  XStack,
} from '../../../packrat-ui';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import useTheme from '../../../hooks/useTheme';
import { Platform, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { fetchTrails } from '../../../store/trailsStore';
import { fetchParks } from '../../../store/parksStore';
import {
  setSelectedSearchResult,
  clearSearchResults,
  fetchPhotonSearchResults,
} from '../../../store/searchStore';
import { fetchWeather, fetchWeatherWeek } from '../../../store/weatherStore';
import useCustomStyles from '~/hooks/useCustomStyles';

export default function SearchScreen() {
  const [searchString, setSearchString] = useState('');
  const [search, setSearch] = useState(false);
  const [isLoadingMobile, setIsLoadingMobile] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState('');

  const { currentTheme } = useTheme();
  const router = useRouter();
  const styles = useCustomStyles(loadStyles());
  const searchResults =
    useSelector((state) => state.search.searchResults) || [];

  const selectedSearchResult =
    useSelector((state) => state.search.selectedSearchResult) || {};

  const [showSearchResults, setShowSearchResults] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    setShowSearchResults(searchString.length > 0);

    const timeout = setTimeout(() => {
      if (!searchString) return;
      dispatch(fetchPhotonSearchResults(searchString));
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchString, dispatch]);

  const getTrailsParksAndWeatherDetails = async () => {
    if (
      !selectedSearchResult ||
      Object.keys(selectedSearchResult).length === 0
    ) {
      return;
    }

    setIsLoadingMobile(true);

    const {
      geometry: { coordinates },
    } = selectedSearchResult;
    const [lon, lat] = coordinates;

    if (!lat || !lon) {
      setIsLoadingMobile(false);
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

    setIsLoadingMobile(false);
  };

  useEffect(() => {
    const timeout = setTimeout(getTrailsParksAndWeatherDetails, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [selectedSearch, selectedSearchResult, dispatch]);

  const handleSearchResultClick = (result, index) => {
    const {
      properties: { name, osm_id },
    } = result;

    setSelectedSearch(name);
    setSearchString(name);
    setShowSearchResults(false);
    dispatch(setSelectedSearchResult(result));

    if (onSelect) {
      onSelect(result);
    }
  };

  const onFocus = () => {
    setSearch(true);
  };
  const onCancel = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView>
      <VStack w="100%" space={5} alignSelf="center">
        <XStack>
          <Input
            onChangeText={(text) => {
              setSearchString(text);
            }}
            placeholder="Search"
            width={search ? '60%' : '95%'}
            borderRadius="4"
            py="3"
            px="2"
            mx={3}
            onFocus={onFocus}
            value={searchString}
            fontSize="14"
            InputLeftElement={
              <Icon
                m="2"
                ml="3"
                size="6"
                color="gray.400"
                as={<MaterialIcons name="search" />}
              />
            }
          />
          {search && (
            <RButton onPress={onCancel} width="30%">
              Cancel
            </RButton>
          )}
        </XStack>

        {showSearchResults && searchResults?.length > 0 && (
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
      </VStack>
    </SafeAreaView>
  );
}
const loadStyles = () => ({
  container: {
    marginTop: 20,
    marginBottom: 15,
    maxWidth: '400px',
  },
});
