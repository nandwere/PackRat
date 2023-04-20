import { StyleSheet } from "react-native";

import {
  VStack,
  Input,
  Icon,
  Box,
  Divider,
  Text,
  ScrollView,
  Button,
  IconButton,
  Center,
  Heading,
  HStack,
  List,
  View,
  Pressable,
} from "native-base";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native";

import { Platform } from "react-native";

// redux
import { useDispatch } from "react-redux";
import { add, addWeek } from "../store/weatherStore";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

// import { getGeoCode } from "../api/getGeoCode";
import { getPhotonResults } from "../api/getPhotonResults";
import { getWeather } from "../api/getWeather";
import { getWeatherWeek } from "../api/getWeatherWeek";
import { setTrails } from "../store/trailsStore";
import { setSearchResults, setSelectedSearchResult, clearSearchResults } from "../store/searchStore";

export const SearchInput = () => {
  const [searchString, setSearchString] = useState("");
  const [isLoadingMobile, setIsLoadingMobile] = useState(false);

  const searchResults = useSelector((state) => state.search.searchResults) || [];

  // const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const dispatch = useDispatch();


  useEffect(() => {
    const getPhotonResultsTimeout = async () => {
      setIsLoadingMobile(true);
      // const trailsData = await getGeoCode(searchString);

      const photonResultsData = await getPhotonResults(searchString);

      setIsLoadingMobile(false);
      // dispatch(setTrails(trailsData))
      dispatch(setSearchResults(photonResultsData))
    };

    if (searchString.length === 0) {
      setShowSearchResults(false);
    } else {
      setShowSearchResults(true);
    }

    console.log('search results', searchResults)

    const timeout = setTimeout(async () => {
      getPhotonResultsTimeout();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [searchString]);


  useEffect(() => {
    console.log('search results', searchResults)
  }, [searchResults]);

  const handleSearchResultClick = (result, index) => {

    const { properties: { name, osm_id } } = result;

    console.log(`Search result ${index} clicked: ${name}`);
    setSearchString(name);
    setShowSearchResults(false);
    dispatch(setSelectedSearchResult(result))
    dispatch(clearSearchResults());

  };

  // useEffect(() => {
  //   const getWeatherObject = async () => {
  //     const object = await getWeather(lat, lon, state);
  //     dispatch(add(object));
  //   };
  //   const getWeek = async () => {
  //     const weeekArray = await getWeatherWeek(lat, lon);
  //     dispatch(addWeek(weeekArray));
  //   };

  //   if (lat && lon) {
  //     getWeatherObject();
  //     getWeek();
  //   }
  // }, [lat, lon, state]);

  return Platform.OS === "web" ? (
    <VStack my="4" space={5} w="100%" maxW="300px">
      {/* ... */}
      <VStack w="100%" space={5} alignSelf="center">
        <Box position="relative" height="auto">
          <Input
            onChangeText={(text) => setSearchString(text)}
            placeholder="Search"
            width="100%"
            borderRadius="4"
            py="3"
            px="1"
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
            InputRightElement={
              showSearchResults && (
                <IconButton
                  mr={2}
                  icon={
                    <Icon
                      as={<MaterialIcons name="close" />}
                      m="0"
                      size="4"
                      color="gray.400"
                    />
                  }
                  onPress={() => {
                    console.log("close button pressed")
                    setShowSearchResults(false);
                    setSearchString("");
                    // dispatch(getTrails([])); // clear search results
                  }}
                />
              )
            }
          />


          {showSearchResults && searchResults?.length > 0 && (
            <ScrollView
              position="absolute"
              top="100%"
              left="0"
              right="0"
              maxHeight="100"
              borderWidth={1}
              borderColor="gray.200"
              borderRadius={4}
              backgroundColor="white"
              showsVerticalScrollIndicator={false}

              zIndex={10}
            >
              <List space={2} mt={2} w="100%">
                {searchResults.map((result, i) => (
                  
                  <Pressable
                    key={`result + ${i}`}
                    onPress={() => handleSearchResultClick(result, i)}
                    underlayColor="gray.100"
                  >
                    <HStack space={3}>
                      <Text fontSize="sm" fontWeight="medium">
                        {result.properties.name}
                      </Text>
                      <Text fontSize="sm" color="gray.500" textTransform={'capitalize'} >
                        {result.properties.osm_value}
                      </Text>
                    </HStack>
                  </Pressable>
                ))}
              </List>
            </ScrollView>
          )}
        </Box>
      </VStack>
    </VStack>
  ) : isLoadingMobile ? (
    <Text>Loading...</Text>
  ) : (
    <VStack w="100%" space={5} alignSelf="center">
      <Input
        onChangeText={(text) => setSearchString(text)}
        placeholder="Search"
        width="100%"
        borderRadius="4"
        py="3"
        px="1"
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
    </VStack>
  );
};
