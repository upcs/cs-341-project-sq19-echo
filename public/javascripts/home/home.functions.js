function getCoordinateFromFeature(feature) {
    if (feature == null) {
        return null;
    }

    var featureGeometry = feature.geometry;
    if (featureGeometry == null) {
        return null;
    }

    var featureCoordinates = featureGeometry.coordinates;
    if (featureCoordinates == null) {
        return null;
    }

    // The coordinates are reversed in the JSON.
    return featureCoordinates.reverse();
}

function getProjectCoords(feature) {
    if (feature == null) {
        return null;
    }

    var featureGeometry = feature.geometry;
    if (featureGeometry == null) {
        return null;
    }

    var featureCoordinates = featureGeometry.coordinates[0];
    if (featureCoordinates == null) {
        return null;
    }

    // The coordinates are reversed in the JSON.
    return featureCoordinates.reverse();
}

function getProjectName(feature) {
    return feature.properties.ProjectName;
}

function getProjectID(feature) {
    return feature.properties.ProjectNumber;
}

function getProjectDescription(feature) {
    return feature.properties.ProjectDescription;
}

function isBikeFeature(feature) {
    if (feature == null) {
        return null;
    }

    var featureProperties = feature.properties;
    if (featureProperties == null) {
        return null;
    }

    return featureProperties.ExceptType === 'Bike Count' || featureProperties.Comment === 'ONLY BIKES';
}

function markerValidForVehicleFilter(leafletMarker, vehicleType) {
    if (leafletMarker == null || vehicleType == null) {
        return null;
    }

    switch (vehicleType) {
        case 'Both':
        case 'Bike':
        case 'Car':
            break;
        default:
            return null;
    }

    if (vehicleType === 'Both') {
        return true;
    }

    var popupContent = leafletMarker.getPopup().getContent().toString();
    if (popupContent.indexOf('Bikes') !== -1 && vehicleType === 'Bike') {
        return true;
    }

    return popupContent.indexOf('Cars') !== -1 && vehicleType === 'Car';
}

function getDensityIconFromTrafficVolume(trafficVolume) {
    if (trafficVolume == null) {
        return null;
    }

    if (inDensityRange(trafficVolume, DENSITIES['High'])) {
        return RED_ICON;
    }

    if (inDensityRange(trafficVolume, DENSITIES['Medium'])) {
        return ORANGE_ICON;
    }

    return GREEN_ICON;
}

function getFeatureStartDate(feature) {
    if (feature == null) {
        return null;
    }

    var featureProperties = feature.properties;
    if (featureProperties == null) {
        return null;
    }

    var startDate = featureProperties.StartDate;
    if (startDate == null) {
        return null;
    }

    return startDate;
}

function getTrafficMarkersFromFeatures(features) {
    if (features == null) {
        return [];
    }

    return features.map(function(feature) {
        return {
            coordinates: getCoordinateFromFeature(feature),
            trafficDensity: getFeatureAdtVolume(feature),
            startDate: getFeatureStartDate(feature),
            isBikeMarker: isBikeFeature(feature)
        };
    });
}

function getPlanMarkersFromFeatures(features) {
    if (features == null) {
        return [];
    }

    return features.map(function (feature) {
        return {
            coordinates: getProjectCoords(feature),
            projectName: getProjectName(feature),
            projectID: getProjectID(feature),
            projectDesc: getProjectDescription(feature)
        };
    });
}

function inDensityRange(inputTrafficDensity, targetDensityRange) {
    if (inputTrafficDensity == null || targetDensityRange == null) {
        return null;
    }

    return inputTrafficDensity >= targetDensityRange.min && inputTrafficDensity <= targetDensityRange.max;
}

function getLeafletMarkerFromFeature(feature) {
    if (feature == null) {
        return null;
    }

    var bikeFeature = isBikeFeature(feature);
    if (bikeFeature == null) {
        return null;
    }

    var vehicle = bikeFeature ? 'Bikes' : 'Cars';

    var trafficVolume = getFeatureAdtVolume(feature);
    if (trafficVolume == null) {
        return null;
    }

    // If trafficVolume is null, this icon will never be null.
    var icon = getDensityIconFromTrafficVolume(trafficVolume);

    var coordinates = getCoordinateFromFeature(feature);
    if (coordinates == null) {
        return null;
    }

    var startDate = getFeatureStartDate(feature);
    if (startDate == null) {
        return null;
    }

    return marker(coordinates, {riseOnHover: true, icon: icon, title: startDate + ' --> ' + trafficVolume})
        .bindPopup('Daily Volume: ' + trafficVolume + ' ' + vehicle);
}

function getLeafletMarkerFromPlanMarker(planMarker) {
    if (planMarker == null) {
        return null;
    }
    return marker(planMarker.coordinates, {riseOnHover: true, icon: DEFAULT_ICON})
        .bindPopup('Project Number: ' + planMarker.projectID);
}

function getFeatureAdtVolume(feature) {
    if (feature == null) {
        return null;
    }

    var featureProperties = feature.properties;
    if (featureProperties == null) {
        return null;
    }

    var adtVolume = featureProperties.ADTVolume;
    if (adtVolume == null) {
        return null;
    }

    return adtVolume;
}

function getMarkerDictKey(area, vehicle, year, density) {
    if (!Object.keys(AREAS).includes(area)) {
        return null;
    }

    if (VEHICLES.indexOf(vehicle) !== -1) {
        return null;
    }

    if (!YEARS.includes(year)) {
        return null;
    }

    if (!Object.keys(DENSITIES).includes(density)) {
        return null;
    }

    return area + ':' + vehicle + ':' + year + ':' + density;
}

function getTrafficDensityFromLeafletMarker(leafletMarker) {
    if (leafletMarker == null) {
        return null;
    }

    var titleWords = leafletMarker.options.title.split(' ');
    return parseInt(titleWords[titleWords.length - 1], 10);
}

function getLeafletMarkerDict(features) {
    if (features == null) {
        return null;
    }

    var allLeafletMarkers = features.map(function (feature) {getLeafletMarkerFromFeature(feature)});

    var leafletMarkerDict = {};
    Object.keys(DENSITIES).forEach(function (density) {
        Object.keys(AREAS).forEach(function (area) {
            YEARS.forEach(function (year) {
                VEHICLES.forEach(function (vehicle) {
                    var markerKey = getMarkerDictKey(area, vehicle, year, density);
                    leafletMarkerDict[markerKey] = allLeafletMarkers.filter(function (marker) {
                            inDensityRange(getTrafficDensityFromLeafletMarker(marker), DENSITIES[density]) &&
                            (marker.options.title.includes(year) || year === YEARS[0]) &&
                            markerValidForVehicleFilter(marker, vehicle)
                        }
                    );
                });
            });
        });
    });
    return leafletMarkerDict;
}
