import { BlurView } from 'expo-blur';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { type ComponentType, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    Linking,
    Platform,
    ScrollView,
    Text,
    type TextStyle,
    View,
    useWindowDimensions,
} from 'react-native';
import { OnboardingViewProps } from './Onboarding.types';

// Animation constants
const ANIMATION_CONFIG = {
    FADE_IN_DURATION: 600,
    MOVE_UP_DURATION: 800,
    FEATURE_DURATION: 750,
    STAGGER_DELAY: 420,
    BUFFER_DELAY: 200,
    INITIAL_SCALE: 0.7,
    BACK_EASING_FACTOR: 1.2,
    FEATURE_TRANSLATE_OFFSET: 42,
    SCREEN_HEIGHT_FACTOR: 0.25,
}

// Text parsing function for links
function parseTextWithLinks(
    description: string,
    links: { sectionText: string; sectionUrl: string }[] = []
): Array<{ type: 'text' | 'link'; content: string; url?: string }> {
    if (!links || links.length === 0) {
        return [{ type: 'text', content: description }]
    }

    // Create array of all link positions in the text
    const linkPositions: Array<{
        start: number
        end: number
        text: string
        url: string
    }> = []

    // Find all occurrences of each link text
    for (const link of links) {
        let startIndex = 0
        while (true) {
            const index = description.indexOf(link.sectionText, startIndex)
            if (index === -1) break

            linkPositions.push({
                start: index,
                end: index + link.sectionText.length,
                text: link.sectionText,
                url: link.sectionUrl,
            })

            startIndex = index + 1
        }
    }

    // Sort by position in text for optimal processing
    linkPositions.sort((a, b) => a.start - b.start)

    // Build segments array
    const segments: Array<{ type: 'text' | 'link'; content: string; url?: string }> = []
    let currentIndex = 0

    for (const linkPos of linkPositions) {
        // Add text before link (if any)
        if (currentIndex < linkPos.start) {
            segments.push({
                type: 'text',
                content: description.slice(currentIndex, linkPos.start),
            })
        }

        // Add link segment
        segments.push({
            type: 'link',
            content: linkPos.text,
            url: linkPos.url,
        })

        currentIndex = linkPos.end
    }

    // Add remaining text after last link (if any)
    if (currentIndex < description.length) {
        segments.push({
            type: 'text',
            content: description.slice(currentIndex),
        })
    }

    return segments
}

// RichText component to render text with clickable links
function RichText({
    description,
    links,
    tintColor,
    style,
}: {
    description: string
    links?: { sectionText: string; sectionUrl: string }[]
    tintColor: string
    style: TextStyle
}) {
    const segments = useMemo(() => parseTextWithLinks(description, links), [description, links])

    const handleLinkPress = useCallback(async (url: string) => {
        try {
            await Linking.openURL(url)
        } catch {
            alert('Could not open link')
        }
    }, [])

    return (
        <Text style={style}>
            {segments.map((segment, index) => {
                if (segment.type === 'link') {
                    return (
                        <Text
                            key={index}
                            style={{
                                ...style,
                                color: tintColor,
                                fontWeight: 700,
                            }}
                            onPress={() => handleLinkPress(segment.url!)}
                        >
                            {segment.content}
                        </Text>
                    )
                }
                return <Text key={index}>{segment.content}</Text>
            })}
        </Text>
    )
}

/**
 * OnboardingView - A beautiful, animated onboarding component for React Native apps.
 * 
 * This component creates a sleek introduction screen that showcases your app's key features
 * with smooth animations, SF Symbols integration, and highly customizable styling options.
 * Perfect for first-time user experiences and feature introductions.
 * 
 * Features:
 * - Smooth fade-in and slide-up animations
 * - SF Symbols integration for consistent iconography
 * - Customizable typography and colors
 * - Support for feature links and interactive elements
 * - Responsive design that adapts to different screen sizes
 * - Built-in blur effects and modern styling
 * 
 * @param features {OnboardingFeature[]} Array of features to display in the onboarding flow. Each feature object contains:
 *   - `title`: The feature's display title
 *   - `description`: Detailed explanation (supports rich text links)
 *   - `systemImage`: SF Symbol name (e.g., "star.fill", "lock.shield.fill")
 *   - `icon`: Optional custom React component for Android (overrides systemImage)
 *   - `links`: Optional array of text segments to make clickable
 * @param icon {ImageSourcePropType} The app icon to display at the top. Accepts require() paths, URIs, or image objects.
 * @param appName {string} Your app's display name shown prominently at the top of the screen.
 * @param tintColor {string} Primary brand color for icons, links, and accents (hex, rgb, or named color).
 * @param titleStyle {object} Typography styling for the main app title:
 *   - `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `color`
 * @param featureTitleStyle {object} Typography styling for each feature's title:
 *   - `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `color`  
 * @param featureDescriptionStyle {object} Typography styling for each feature's description:
 *   - `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `color`
 * @param ButtonComponent {ComponentType} React component for rendering interactive buttons and links.
 * 
 * @example
 * ```tsx
 * <OnboardingView
 *   appName="My Amazing App"
 *   icon={require('./assets/app-icon.png')}
 *   tintColor="#007AFF"
 *   features={[
 *     {
 *       title: "Fast & Reliable",
 *       description: "Experience lightning-fast performance",
 *       systemImage: "bolt.fill"
 *     },
 *     {
 *       title: "Secure by Design", 
 *       description: "Your data is protected with end-to-end encryption",
 *       systemImage: "lock.shield.fill"
 *     }
 *   ]}
 *   titleStyle={{ fontSize: 28, fontWeight: 'bold' }}
 *   featureTitleStyle={{ fontSize: 18, fontWeight: '600' }}
 *   featureDescriptionStyle={{ fontSize: 16, color: '#666' }}
 *   ButtonComponent={MyCustomButton}
 * />
 * ```
 */
export default function OnboardingView({
    appName,
    icon,
    features,
    titleStyle,
    featureTitleStyle,
    featureDescriptionStyle,
    tintColor,
    ButtonComponent,
}: OnboardingViewProps) {
    const { height: screenHeight } = useWindowDimensions()

    // Shared values for animations
    const iconTitleOpacity = useRef(new Animated.Value(0)).current
    const iconTitleScale = useRef(new Animated.Value(ANIMATION_CONFIG.INITIAL_SCALE)).current
    const iconTitleTranslateY = useRef(
        new Animated.Value(screenHeight * ANIMATION_CONFIG.SCREEN_HEIGHT_FACTOR)
    ).current
    const blurViewOpacity = useRef(new Animated.Value(0)).current

    // State to trigger feature animations
    const [shouldAnimateFeatures, setShouldAnimateFeatures] = useState(false)

    // Start animation sequence on mount
    useEffect(() => {
        // Step 1: Icon and title fade in + zoom in
        Animated.timing(iconTitleOpacity, {
            toValue: 1,
            duration: ANIMATION_CONFIG.FADE_IN_DURATION,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start()

        Animated.timing(iconTitleScale, {
            toValue: 1,
            duration: ANIMATION_CONFIG.FADE_IN_DURATION,
            easing: Easing.out(Easing.back(ANIMATION_CONFIG.BACK_EASING_FACTOR)),
            useNativeDriver: true,
        }).start()

        // Step 2: Move them up after fade+zoom completes
        setTimeout(() => {
            Animated.timing(iconTitleTranslateY, {
                toValue: 0,
                duration: ANIMATION_CONFIG.MOVE_UP_DURATION,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start()
        }, ANIMATION_CONFIG.FADE_IN_DURATION)

        // Step 3: Trigger features to animate after move completes
        const featureAnimationTriggerDelay =
            ANIMATION_CONFIG.FADE_IN_DURATION +
            ANIMATION_CONFIG.MOVE_UP_DURATION +
            ANIMATION_CONFIG.BUFFER_DELAY

        setTimeout(() => {
            setShouldAnimateFeatures(true)
        }, featureAnimationTriggerDelay)

        // Step 4: Blur view animates after all features complete
        setTimeout(
            () => {
                Animated.timing(blurViewOpacity, {
                    toValue: 1,
                    duration: ANIMATION_CONFIG.FEATURE_DURATION,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }).start()
            },
            featureAnimationTriggerDelay +
                features.length * ANIMATION_CONFIG.STAGGER_DELAY +
                ANIMATION_CONFIG.BUFFER_DELAY
        )
    }, [iconTitleOpacity, iconTitleScale, iconTitleTranslateY, blurViewOpacity, features.length])

    // Animated styles
    const iconTitleAnimatedStyle = {
        opacity: iconTitleOpacity,
        transform: [{ translateY: iconTitleTranslateY }, { scale: iconTitleScale }],
    }

    const blurViewAnimatedStyle = {
        opacity: blurViewOpacity,
    }

    const memoizedTitleStyle = useMemo(
        () => ({
            color: 'white',
            textAlign: 'center',
            fontSize: 36,
            fontWeight: 800,
            ...titleStyle,
        } as const),
        [titleStyle]
    )

    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'column',
            }}
        >
            <ScrollView
                style={{
                    flex: 1,
                    paddingHorizontal: 42,
                }}
                contentContainerStyle={{
                    flexDirection: 'column',
                    gap: 64,
					paddingBottom: 200,
                }}
				showsHorizontalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        {
                            flexDirection: 'column',
                            gap: 28,
                        },
                        iconTitleAnimatedStyle,
                    ]}
                >
                    <View
                        style={{
                            width: 100,
                            height: 100,
                            alignSelf: 'center',
                            overflow: 'hidden',
                            borderRadius: 16.5,
                        }}
                    >
                        <Image source={icon} style={{ width: 100, height: 100 }} />
                    </View>

                    <Text style={memoizedTitleStyle}>
                        Welcome to <Text style={{ color: tintColor }}>{appName}</Text>
                    </Text>
                </Animated.View>

                <View
                    style={{
                        flexDirection: 'column',
                        gap: 42,
                    }}
                >
                    {features.map((feature, index) => (
                        <Feature
                            key={index}
                            title={feature.title}
                            description={feature.description}
                            systemImage={feature.systemImage}
                            IconComponent={feature.icon}
                            tintColor={tintColor}
                            titleStyle={featureTitleStyle}
                            descriptionStyle={featureDescriptionStyle}
                            links={feature.links}
                            animationDelay={index * ANIMATION_CONFIG.STAGGER_DELAY}
                            shouldAnimate={shouldAnimateFeatures}
                        />
                    ))}
                </View>
            </ScrollView>

            {ButtonComponent && (
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                        },
                        blurViewAnimatedStyle,
                    ]}
                >
                    <BlurView
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#00000090',
                            paddingBottom: 52,
                            paddingTop: 24,
                        }}
                        intensity={12}
                    >
                        <ButtonComponent />
                    </BlurView>
                </Animated.View>
            )}
        </View>
    )
}

function Feature({
    title,
    description,
    systemImage,
    IconComponent,
    tintColor,
    titleStyle,
    descriptionStyle,
    links,
    animationDelay = 0,
    shouldAnimate = false,
}: {
    title: string
    description: string
    systemImage: SymbolViewProps['name']
    IconComponent?: ComponentType
    tintColor: string
    titleStyle: {
        fontFamily?: TextStyle['fontFamily']
        fontSize?: TextStyle['fontSize']
        fontWeight?: TextStyle['fontWeight']
        lineHeight?: TextStyle['lineHeight']
        color?: TextStyle['color']
    }
    descriptionStyle: {
        fontFamily?: TextStyle['fontFamily']
        fontSize?: TextStyle['fontSize']
        fontWeight?: TextStyle['fontWeight']
        lineHeight?: TextStyle['lineHeight']
        color?: TextStyle['color']
    }
    links?: { sectionText: string; sectionUrl: string }[]
    animationDelay?: number
    shouldAnimate?: boolean
}) {
    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(ANIMATION_CONFIG.FEATURE_TRANSLATE_OFFSET)).current

    // Trigger animation when shouldAnimate changes
    useEffect(() => {
        if (shouldAnimate) {
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: ANIMATION_CONFIG.FEATURE_DURATION,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: ANIMATION_CONFIG.FEATURE_DURATION,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]).start()
            }, animationDelay)
        }
    }, [shouldAnimate, animationDelay, opacity, translateY])

    const isAndroid = useMemo(() => Platform.OS === 'android', [])

    const memoizedTitleStyle = useMemo(
        () => ({
            color: 'white',
            fontSize: 18,
            fontWeight: 600,
            ...titleStyle,
        } as const),
        [titleStyle]
    )

    const memoizedDescriptionStyle = useMemo(
        () => ({
            color: 'gray',
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 24,
            ...descriptionStyle,
        } as const),
        [descriptionStyle]
    )

    const animatedStyle = {
        opacity: opacity,
        transform: [{ translateY: translateY }],
    }

    const staticStyle = {
        width: '100%',
        maxWidth: 550,
        alignSelf: 'center' as const,
    }

    return (
        <Animated.View style={[animatedStyle, staticStyle] as any}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 12,
                }}
            >
                {isAndroid ? (
                    IconComponent ? (
                        <IconComponent />
                    ) : (
                        <View
                            style={{
                                width: 42,
                                height: 42,
                                backgroundColor: tintColor,
                                borderRadius: 21,
                            }}
                        />
                    )
                ) : (
                    <SymbolView name={systemImage} size={42} tintColor={tintColor} />
                )}

                <View style={{ flexDirection: 'column', gap: 2, flex: 1 }}>
                    <Text style={memoizedTitleStyle}>{title}</Text>
                    <RichText
                        description={description}
                        links={links}
                        tintColor={tintColor}
                        style={memoizedDescriptionStyle}
                    />
                </View>
            </View>
        </Animated.View>
    )
}
