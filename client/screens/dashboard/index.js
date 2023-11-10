import React, { useState } from 'react';
import { Platform, SafeAreaView, View, StyleSheet } from 'react-native';
import { VStack, Box, ScrollView } from 'native-base';
import { theme } from '../../theme';
import useTheme from '../../hooks/useTheme';
import HeroBanner from '../../components/dashboard/HeroBanner';
import QuickActionsSection from '../../components/dashboard/QuickActionSection';
import FeedPreview from '../../components/dashboard/FeedPreview';
import Section from '../../components/dashboard/Section';
import SectionHeader from '../../components/dashboard/SectionHeader';
import useCustomStyles from '~/hooks/useCustomStyles';
import { SearchComponent } from '../../components/SearchComponent';

const Dashboard = () => {
  const styles = useCustomStyles(loadStyles);
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearch = (searchText) => {
    console.log('Search Query:', searchText);
    // Update the state or perform any other actions based on the search query
    setSearchText(searchText);
  };

  const onSearchFocus = () => {
    setSearchFocus(!searchFocus);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} horizontal={false}>
        <VStack
          style={[
            styles.container,
            Platform.OS === 'web' ? { minHeight: '100vh' } : null,
          ]}
        >
          <Box>
            {searchFocus && Platform.OS !== 'web' && (
              <View style={styles.searchView}>
                <SearchComponent
                  focused={searchFocus}
                  onSearchFocus={onSearchFocus}
                  onSearch={handleSearch}
                  searchText={searchText}
                  onChangeText={setSearchText}
                />
              </View>
            )}
            <HeroBanner
              style={styles.cardContainer}
              onSearchFocus={onSearchFocus}
              onSearch={handleSearch}
            />
            <Section>
              <SectionHeader
                iconName="add-circle-outline"
                text="Quick Actions"
              />
              <QuickActionsSection />
            </Section>
            <Section>
              <SectionHeader iconName="newspaper-outline" text="Feed" />
              <FeedPreview />
            </Section>
          </Box>
        </VStack>
      </ScrollView>
    </>
  );
};

const loadStyles = (theme) => {
  const { currentTheme } = theme;
  return {
    container: {
      flex: 1,
      flexGrow: 1,
      backgroundColor: currentTheme.colors.background,
      width: '100%',
    },
    content: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      // paddingHorizontal: 20,
    },
    cardContainer: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginBottom: 20,
      width: '100%',
    },
    searchView: {
      flex: 1,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: 1,
    },
  };
};

export default Dashboard;
