import{ OnboardingFeature, OnboardingView } from 'expo-onboarding';
import { Text, TouchableOpacity, View  } from 'react-native';

const FEATURES: OnboardingFeature[] = [
    {
        title: 'Feature One',
        description:
            'This is the first amazing feature of our app. It helps you accomplish great things.',
        systemImage: 'star.fill',
    },
    {
        title: 'Feature Two',
        description:
            'Our second feature is even better! Connect with others and share your experience.',
        systemImage: 'heart.fill',
        links: [
            {
                sectionText: 'Connect with others',
                sectionUrl: 'https://example.com',
            },
        ],
    },
    {
        title: 'Feature Three',
        description:
            'The third feature ensures your privacy and security while using our amazing app.',
        systemImage: 'shield.fill',
    },
]

export default function App() {
  return (
  	  <View style={{
			flex: 1,
			backgroundColor: 'black',
			paddingTop: '20%',
		}}>
			<OnboardingView
				features={FEATURES}
				icon={require('./assets/icon.png')}
				appName="DemoApp"
				tintColor={'blue'}
				titleStyle={{}}
				featureTitleStyle={{
					color: 'white',
				}}
				featureDescriptionStyle={{
					color: 'gray',
				}}
				ButtonComponent={() => (
					<TouchableOpacity
						style={{
							width: '100%',
							maxWidth: '80%',
							backgroundColor: 'blue',
							padding: 10,
							borderRadius: 12.5,
						}}
						onPress={() => {
							alert('Hello')
						}}
					>
						<Text
							style={{
								color: 'white',
								textAlign: 'center',
								fontSize: 20,
								fontWeight: 600,
								paddingTop: 4,
								paddingBottom: 6,
							}}
						>
							Get Started
						</Text>
					</TouchableOpacity>
				)}
			/>
      </View>
  );
}
